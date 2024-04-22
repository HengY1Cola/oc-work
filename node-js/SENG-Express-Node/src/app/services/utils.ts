import e, {Request, Response} from "express";
import jwt from 'jsonwebtoken';
import Logger from '../../config/logger';
import {findAuthTokenById, findUserByEmail, updateAuthTokenById} from "../models/user.model";

const respCustom = (resp: Response, code: number, msg: string): Response => {
    resp.statusMessage = msg;
    resp.status(code)
    return resp
}

// Function to validate required fields
const validateRequiredFields = (req: Request, fields: string[]): { valid: boolean, missingFields: string[] } => {
    const missingFields = fields.filter(field => !(field in req.body));
    return {
        valid: missingFields.length === 0,
        missingFields,
    };
};

// Function to validate email format
const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validateEmailLength = (email: string, minLength: number, maxLength: number): boolean => {
    return email.length >= minLength && email.length <= maxLength;
};

const validatePasswordLength = (password: string): boolean => {
    return password.length >= 6;
}

interface JwtPayload {
    userId: number
}

const generateJWT = (userId: number): string => {
    const secretKey = "yli431"
    const expiresIn = 72000;
    return jwt.sign({userId}, secretKey, {expiresIn});
};

// Function to verify JWT Token and extract userId
const verifyToken = async (token: string): Promise<{ valid: boolean, userId?: number }> => {
    const secretKey = "yli431";
    try {
        const decoded = jwt.verify(token, secretKey) as JwtPayload;
        const authToken = await findAuthTokenById(decoded.userId);
        if (token === authToken) {
            return {valid: true, userId: decoded.userId as number};
        }
        return {valid: false};
    } catch (error) {
        Logger.error(error)
        const decoded = jwt.decode(token) as JwtPayload;
        if (decoded?.userId) {
            await updateAuthTokenById(decoded.userId, "");
        }
        return {valid: false};
    }
};

export {
    respCustom,
    validateRequiredFields,
    validateEmailFormat,
    generateJWT,
    verifyToken,
    validatePasswordLength,
    validateEmailLength
}