import {Request, Response} from "express";
import Logger from "../../config/logger";
import {respCustom} from "../services/utils";
import {findPetitionById, Petition, updatePetition} from "../models/petition.model";
import {
    addSupportTierData, deleteSupportTierById,
    doesSupportTierExistByTitle, findSupportTierById,
    findSupportTiersByPetitionId, SupportTier, updateSupportTier
} from "../models/support_tier.model";
import {doesSupporterExistBySupportTier} from "../models/supporter.model";

const addSupportTier = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const {title, description, cost} = req.body;
        if (!id || isNaN(Number(id)) || Number(id) < 0 || !title || !description || isNaN(Number(cost)) || Number(cost) < 0) {
            respCustom(res, 400, "Bad Request").send();
            return
        }
        const petition = await findPetitionById(Number(id));
        if (!petition) {
            respCustom(res, 404, "Not Found").send();
            return
        }
        if (petition.ownerId !== req.userId) {
            respCustom(res, 403, "Only the owner of a petition may modify it").send();
            return
        }
        const existingTiers = await findSupportTiersByPetitionId(petition.id);
        if (existingTiers.length >= 3) {
            respCustom(res, 403, "Can add a support tier if 3 already exist").send();
            return
        }
        const doesExist = await doesSupportTierExistByTitle(title);
        if (doesExist) {
            respCustom(res, 403, "Support title not unique within petition").send();
            return;
        }
        const newSupportTier: SupportTier = {
            petition_id: petition.id,
            title,
            description,
            cost
        };
        await addSupportTierData(newSupportTier);
        // 返回新添加的支持等级信息
        res.status(201).json({
            title: newSupportTier.title,
            description: newSupportTier.description,
            cost: newSupportTier.cost
        });
        return;
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

const editSupportTier = async (req: Request, res: Response): Promise<void> => {
    try {
        const petitionId = parseInt(req.params.id, 10);
        const tierIdId = parseInt(req.params.tierId, 10);
        if (isNaN(tierIdId) || tierIdId < 0) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }
        if (isNaN(petitionId) || petitionId < 0) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }
        const {title, description, cost} = req.body;
        if (!title || !description || isNaN(Number(cost)) || Number(cost) < 0) {
            respCustom(res, 400, "Bad Request").send();
            return
        }
        if (title && await doesSupportTierExistByTitle(title)) {
            respCustom(res, 403, "Support title not unique within petition").send();
            return;
        }
        const petition = await findPetitionById(petitionId);
        if (!petition) {
            respCustom(res, 404, "No petition found with id").send();
            return;
        }
        if (petition.ownerId !== req.userId) {
            respCustom(res, 403, "Only the owner of a petition may modify it").send();
            return;
        }
        const tier = await findSupportTierById(tierIdId);
        if (!tier) {
            respCustom(res, 404, "Not Found").send();
            return;
        }
        if (await doesSupporterExistBySupportTier(tierIdId)) {
            respCustom(res, 403, "Can not edit a support tier if a supporter already exists for it").send();
            return;
        }
        const updatedTier = {
            ...tier,
            title: title !== undefined ? title : tier.title,
            description: description !== undefined ? description : tier.description,
            cost: cost !== undefined ? cost : tier.cost,
        };
        await updateSupportTier(updatedTier);
        respCustom(res, 200, "OK").json({
            title: updatedTier.title,
            description: updatedTier.description,
            cost: updatedTier.cost,
        }).send();
        return;
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

const deleteSupportTier = async (req: Request, res: Response): Promise<void> => {
    try {
        const petitionId = parseInt(req.params.id, 10);
        const tierId = parseInt(req.params.tierId, 10);
        if (isNaN(petitionId) || petitionId < 0 || isNaN(tierId) || tierId < 0) {
            respCustom(res, 400, "Bad Request").send();
            return;
        }
        const petition = await findPetitionById(petitionId);
        if (!petition) {
            respCustom(res, 404, "Not Found").send();
            return;
        }
        if (petition.ownerId !== req.userId) {
            respCustom(res, 403, "Only the owner of a petition may delete it").send();
            return;
        }
        const tier = await findSupportTierById(tierId);
        if (!tier) {
            respCustom(res, 404, "Not Found").send();
            return;
        }
        const hasSupporters = await doesSupporterExistBySupportTier(tierId);
        if (hasSupporters) {
            respCustom(res, 403, "Can not delete a support tier if a supporter already exists for it").send();
            return;
        }
        const existingTiers = await findSupportTiersByPetitionId(petition.id);
        if (existingTiers.length === 1) {
            respCustom(res, 403, "Can not remove a support tier if it is the only one for a petitiont").send();
            return;
        }
        await deleteSupportTierById(tierId);
        respCustom(res, 200, "OK").send();
        return;
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

export {addSupportTier, editSupportTier, deleteSupportTier};