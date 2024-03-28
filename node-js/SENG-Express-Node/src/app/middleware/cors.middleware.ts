import {Request, Response, NextFunction} from "express";
import {respCustom, verifyToken} from "../services/utils";

const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers['x-authorization'];
    if (!token) {
        respCustom(res, 401, "Unauthorized").send();
        return;
    }
    const {valid, userId} = await verifyToken(token.toString());
    if (!valid) {
        respCustom(res, 401, "Unauthorized").send();
        return;
    }
    req.userId = userId;
    next();
};

const cors = (req: Request, res: Response, next: () => void) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
    next();
}

export {cors, authenticate}