import {Request, Response} from "express";
import Logger from "../../config/logger";
import {respCustom} from "../services/utils";
import {findPetitionById, updatePetition} from "../models/petition.model";
import path from "node:path";
import fs from 'fs';

const imageDirectory = 'src/app/resources/';

const getImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const petitionId = parseInt(req.params.id, 10);
        if (isNaN(petitionId) || petitionId < 0) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }
        const petition = await findPetitionById(petitionId);
        if (!petition) {
            respCustom(res, 404, "No petition with id").send();
            return;
        }
        if (!petition.imageFilename) {
            respCustom(res, 404, "Petition has no imaged").send();
            return;
        }

        const imagePath = path.join(imageDirectory, petition.imageFilename);
        Logger.info(imagePath)
        if (!fs.existsSync(imagePath)) {
            respCustom(res, 404, "Image file not found").send();
            return;
        }
        const imageType = path.extname(petition.imageFilename).toLowerCase();
        switch (imageType) {
            case '.jpg':
            case '.jpeg':
                res.setHeader('Content-Type', 'image/jpeg');
                break;
            case '.png':
                res.setHeader('Content-Type', 'image/png');
                break;
            case '.gif':
                res.setHeader('Content-Type', 'image/gif');
                break;
            default:
                respCustom(res, 400, "Unsupported image type").send();
                return;
        }
        const readStream = fs.createReadStream(imagePath);
        readStream.pipe(res);
        // respCustom(res, 200, "OK").json({file_name: petition.imageFilename}).send();
        // return;
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

const setImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const petitionId = parseInt(req.params.id, 10);
        if (isNaN(petitionId) || petitionId < 0) {
            respCustom(res, 400, "Bad Request").send();
            return;
        }
        const petition = await findPetitionById(petitionId);
        if (!petition) {
            respCustom(res, 404, "No petition found with id").send();
            return;
        }
        if (petition.ownerId !== req.userId) {
            respCustom(res, 403, " Only the owner of a petition can change the hero image").send();
            return;
        }
        const contentType = req.headers['content-type'];
        if (!contentType || (contentType !== 'image/png' && contentType !== 'image/jpeg' && contentType !== 'image/gif')) {
            respCustom(res, 400, "Invalid image supplied (possibly incorrect file type)").send();
            return;
        }
        // const imageFilename = `img_${req.userId}_${Math.floor(Date.now() / 1000)}.${contentType.split('/')[1]}`;
        const imageFilename = `demo.${contentType.split('/')[1]}`;
        const updatedPetition = {
            ...petition,
            imageFilename
        };
        await updatePetition(updatedPetition);
        if (petition.imageFilename) {
            respCustom(res, 200, "Created. New image created").json({filename: imageFilename}).send();
        } else {
            respCustom(res, 201, "OK. Image updated").json({filename: imageFilename}).send();
        }
        return
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}


export {getImage, setImage};