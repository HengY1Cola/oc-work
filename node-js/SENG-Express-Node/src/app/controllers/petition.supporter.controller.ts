import {Request, Response} from "express";
import Logger from "../../config/logger";
import {respCustom} from "../services/utils";
import {findPetitionById, Petition} from "../models/petition.model";
import {addSupporterData, findSupportersByPetitionId, Supporter} from "../models/supporter.model";
import {findUserById} from "../models/user.model";
import {findSupportTierById} from "../models/support_tier.model";


const getAllSupportersForPetition = async (req: Request, res: Response): Promise<void> => {
    try {
        const petitionId = parseInt(String(req.params.id), 10);
        if (isNaN(petitionId) || petitionId < 0) {
            respCustom(res, 400, "Invalid petition ID").send();
            return;
        }
        const petition = await findPetitionById(petitionId);
        if (!petition) {
            respCustom(res, 404, "No petition with id").send();
            return;
        }
        const supporters = await findSupportersByPetitionId(petitionId);
        const supporterDetails = await Promise.all(supporters.map(async (supporter) => {
            const user = await findUserById(supporter.userId);
            return {
                supportId: supporter.id,
                supportTierId: supporter.supportTierId,
                message: supporter.message,
                supporterId: user.id,
                supporterFirstName: user.first_name,
                supporterLastName: user.last_name,
                timestamp: supporter.timestamp
            };
        }));
        supporterDetails.reverse();
        res.json(supporterDetails);
        return;
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

const addSupporter = async (req: Request, res: Response): Promise<void> => {
    try {
        const petitionId = parseInt(String(req.params.id), 10);
        const {supportTierId, message} = req.body;
        if (isNaN(petitionId) || petitionId < 0) {
            respCustom(res, 400, "Bad Request").send();
            return;
        }
        const petition = await findPetitionById(petitionId);
        if (!petition) {
            respCustom(res, 404, "No petition found with id").send();
            return;
        }
        if (isNaN(supportTierId) || supportTierId < 0) {
            respCustom(res, 400, "Bad Request").send();
            return;
        }
        const supportTier = await findSupportTierById(supportTierId);
        if (!supportTier || supportTier.petition_id !== petitionId) {
            respCustom(res, 404, "Support tier does not exist").send();
            return;
        }

        const existingSupporters = await findSupportersByPetitionId(petitionId);
        const alreadySupported = existingSupporters.some(supporterEach => supporterEach.userId === req.userId);
        if (alreadySupported) {
            respCustom(res, 403, "Already supported at this tier").send();
            return;
        }
        const supporterData: Supporter = {
            petitionId,
            supportTierId,
            userId: req.userId,
            message,
            timestamp: new Date(),
        };
        await addSupporterData(supporterData);
        respCustom(res, 201, "Supporter added successfully").send();
        return;
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

export {getAllSupportersForPetition, addSupporter}