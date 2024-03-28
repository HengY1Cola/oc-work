import {Request, Response} from "express";
import Logger from '../../config/logger';
import {User} from "../models/user.model";
import {
    generateJWT,
    respCustom,
    validateEmailFormat,
    validatePasswordLength,
    validateRequiredFields, verifyToken
} from "../services/utils";
import {hash} from "../services/passwords";
import {
    createUser,
    findUserByEmail,
    findUserById,
    isUserExistsByEmail,
    updateAuthTokenById, updateUser
} from "../models/user.model";


const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const {valid, missingFields} = validateRequiredFields(req, ['firstName', 'lastName', 'email', 'password']);
        if (!valid) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }
        const {firstName, lastName, email, password} = req.body;
        if (!validateEmailFormat(email)) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }
        if (!validatePasswordLength(password)) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }

        const userExists = await isUserExistsByEmail(email);
        if (userExists) {
            respCustom(res, 403, "Email already in use").send();
            return;
        }
        const hashedPassword = await hash(password);
        const user = await createUser({first_name: firstName, last_name: lastName, email, password: hashedPassword});
        if (user) {
            respCustom(res, 201, "Created").json({userId: user}).send();
        } else {
            respCustom(res, 500, "Internal Sever Error").send();
        }
        return;
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const {valid, missingFields} = validateRequiredFields(req, ['email', 'password']);
        if (!valid) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }
        const {email, password} = req.body;
        if (!validateEmailFormat(email)) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }
        const user = await findUserByEmail(email);
        if (!user) {
            respCustom(res, 401, "Incorrect email/password").send();
            return;
        }
        const hashedPassword = await hash(password);
        if (user.password !== hashedPassword) {
            respCustom(res, 401, "Incorrect email/password").send();
            return;
        }
        Logger.info(`password ${password} => hash ${hashedPassword}`)
        const token = generateJWT(user.id);
        await updateAuthTokenById(user.id, token);
        res.setHeader('X-Authorization', token);
        respCustom(res, 200, "OK").json({userId: user.id, token}).send();
        return;
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        await updateAuthTokenById(req.userId, '');
        respCustom(res, 200, "OK").send();
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

const view = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId) || userId < 0) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }
        const user = await findUserById(userId);
        if (!user) {
            respCustom(res, 404, "No user with specified ID").send();
            return;
        }
        respCustom(res, 200, "OK").json({
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email
        }).send(); // 找到用
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

const update = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId) || userId < 0) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }
        if (userId !== req.userId) {
            respCustom(res, 400, "No Same one").send();
            return;
        }
        const {firstName, lastName, email, password, currentPassword} = req.body;
        if (email && !validateEmailFormat(email)) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }
        if ((password && !validatePasswordLength(password)) || (currentPassword && !validatePasswordLength(currentPassword))) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }
        const currentUser = await findUserById(userId);
        if (!currentUser) {
            respCustom(res, 404, "No user with specified ID").send();
            return;
        }
        const updateUserData = {
            ...(firstName ? {first_name: firstName} : {}),
            ...(lastName ? {last_name: lastName} : {}),
            ...(email ? {email} : {}),
            ...(password && currentPassword ? {password: await hash(password)} : {}),
        } as User
        const updated = await updateUser(updateUserData);
        if (updated) {
            respCustom(res, 200, "User updated successfully").send();
        } else {
            respCustom(res, 500, "Failed to update user").send();
        }
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

export {register, login, logout, view, update}