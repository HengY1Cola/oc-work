import {Request, Response} from "express";
import Logger from "../../config/logger";
import {respCustom} from "../services/utils";
import {findUserById, updateImageFilenameById} from "../models/user.model";

const getImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId) || userId < 0) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }
        const user = await findUserById(userId);
        if (!user || user.image_filename === "") {
            respCustom(res, 404, "No user with specified ID, or user has no image").send();
            return;
        }
        res.setHeader('Content-Type', "image/jpeg");
        respCustom(res, 200, "OK").json({filename: user.image_filename}).send();
        return;
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

const setImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId) || userId < 0) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }
        if (req.userId !== userId) {
            respCustom(res, 403, "Can not change another user's profile photo").send();
            return;
        }
        const contentType = req.headers['content-type'];
        if (!contentType || (contentType !== 'image/png' && contentType !== 'image/jpeg' && contentType !== 'image/gif')) {
            respCustom(res, 400, "Invalid image supplied (possibly incorrect file type)").send();
            return;
        }
        // const imageBuffer = await new Promise<Buffer>((resolve, reject) => {
        //     let data = Buffer.alloc(0);
        //     req.on('data', (chunk) => {
        //         data = Buffer.concat([data, chunk]);
        //     });
        //     req.on('end', () => resolve(data));
        //     req.on('error', (err) => reject(err));
        // });
        const imageFilename = `user_${userId}_${Math.floor(Date.now() / 1000)}.${contentType.split('/')[1]}`;
        const user = await findUserById(userId);
        if (!user) {
            respCustom(res, 404, "No such user with ID given").send();
            return;
        }
        const isSuccess = await updateImageFilenameById(userId, imageFilename);
        if (!isSuccess) {
            respCustom(res, 500, "Internal Server Error").send();
        }
        if (user.image_filename === "") {
            respCustom(res, 201, "Created. New image created").json({filename: imageFilename}).send();
        } else {
            respCustom(res, 201, "OK. Image updated").json({filename: imageFilename}).send();
        }
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

const deleteImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId) || userId < 0) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }
        if (req.userId !== userId) {
            respCustom(res, 403, "Can not delete another user's profile photo").send();
            return;
        }
        const user = await findUserById(userId);
        if (!user) {
            respCustom(res, 404, "No such user with ID given").send();
            return;
        }
        const isSuccess = await updateImageFilenameById(userId, "");
        if (!isSuccess) {
            respCustom(res, 500, "Internal Server Error").send();
            return;
        }
        respCustom(res, 200, "OK").send();
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

export {getImage, setImage, deleteImage}