import {Request, Response} from "express";
import Logger from '../../config/logger';
import {respCustom, validateEmailLength, validateRequiredFields} from "../services/utils";
import {
    addPetitionModel, deletePetitionById,
    doesPetitionExistByTitle,
    findAllPetitions,
    findPetitionById,
    Petition, updatePetition
} from "../models/petition.model";
import {addSupportTierData, doesSupportTierExistByTitle, findAllSupportTiers} from "../models/support_tier.model";
import {findAllSupporters} from "../models/supporter.model";
import {aggregateData, FilterCriteria, filterPetitions, paginatePetitions, sortPetitions} from "../services/petition";
import {findAllCategories} from "../models/category.model";
import {findUserById} from "../models/user.model";

const getAllPetitions = async (req: Request, res: Response): Promise<void> => {
    try {
        const {startIndex = 0, count = 100, q, supportingCost, ownerId, supporterId} = req.query;
        const startIndexInt = parseInt(String(startIndex), 10);
        const countInt = parseInt(String(count), 10);
        if (startIndexInt < 0 || countInt < 0) {
            respCustom(res, 400, "Bad Request").send();
            return;
        }
        if (q !== undefined && q === '') {
            respCustom(res, 400, "Bad Request").send();
            return;
        }
        if (supporterId !== undefined && !/^\d+$/.test(supporterId as string)) {
            respCustom(res, 400, "Bad Request").send();
            return;
        }
        const categoryIdsRaw = req.query.categoryIds;
        let categoryIdsList: number[] = [];
        if (Array.isArray(categoryIdsRaw)) {
            categoryIdsList = categoryIdsRaw.map(id => parseInt(id as string, 10));
        } else if (categoryIdsRaw) {
            categoryIdsList = [parseInt(categoryIdsRaw as string, 10)];
        }

        let petitions = await findAllPetitions();
        const supportTiers = await findAllSupportTiers();
        const supporters = await findAllSupporters();
        petitions = aggregateData(petitions, supportTiers, supporters)

        const filterCriteria: FilterCriteria = {
            q: q as string,
            supportingCost: supportingCost ? parseInt(supportingCost as string, 10) : undefined,
            ownerId: ownerId ? parseInt(ownerId as string, 10) : undefined,
            supporterId: supporterId ? parseInt(supporterId as string, 10) : undefined,
            categoryIdsList: categoryIdsList ? categoryIdsList : undefined,
        };
        let filteredPetitions = filterPetitions(petitions, filterCriteria);
        const sortByRaw = req.query.sortBy || 'CREATED_ASC';

        function isString(value: any): value is string {
            return typeof value === 'string';
        }

        let sortBy: string;
        if (Array.isArray(sortByRaw)) {
            sortBy = isString(sortByRaw[0]) ? sortByRaw[0] : 'CREATED_ASC';
        } else if (isString(sortByRaw)) {
            sortBy = sortByRaw;
        } else {
            sortBy = 'CREATED_ASC';
        }
        try {
            filteredPetitions = sortPetitions(filteredPetitions, sortBy);
        } catch (e) {
            respCustom(res, 400, "Sort type err").send();
            return;
        }
        const paginatedPetitions = paginatePetitions(filteredPetitions, startIndexInt, countInt);
        respCustom(res, 200, "OK").json({
            petitions: paginatedPetitions,
            count: filteredPetitions.length
        }).send();
        return;
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}


const getPetition = async (req: Request, res: Response): Promise<void> => {
    try {
        const petitionId = parseInt(req.params.id, 10);
        if (isNaN(petitionId) || petitionId < 0) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }

        const petitionsOne = await findPetitionById(petitionId);
        if (!petitionsOne) {
            respCustom(res, 404, "No Found").send();
            return;
        }
        let petitions: Petition[] = [petitionsOne]
        const supportTiers = await findAllSupportTiers();
        const supporters = await findAllSupporters();
        petitions = aggregateData(petitions, supportTiers, supporters)
        if (petitions.length === 0) {
            respCustom(res, 404, "No petition with id").send();
            return;
        }
        const petition = petitions[0];
        const user = await findUserById(petition.ownerId);
        if (!user) {
            respCustom(res, 404, "Owner not found").send();
            return;
        }
        const result = {
            description: petition.description,
            moneyRaised: petition.supportingCost,
            supportTiers: petition.tierList,
            petitionId: petition.petitionId,
            title: petition.title,
            categoryId: petition.categoryId,
            ownerId: petition.ownerId,
            ownerFirstName: user.first_name,
            ownerLastName: user.last_name,
            numberOfSupporters: supporters.length,
            creationDate: petition.creationDate.toISOString()
        };
        respCustom(res, 200, "OK").json(result).send();
        return;
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

const addPetition = async (req: Request, res: Response): Promise<void> => {
    try {
        const {title, description, categoryId, supportTiers} = req.body;
        const requiredFields = ['title', 'description'];
        if (!validateRequiredFields(req.body, requiredFields) || categoryId < 0) {
            respCustom(res, 400, "Bad Request").send();
            return;
        }
        if (title === "") {
            respCustom(res, 400, "Bad Request").send();
            return;
        }
        if (!Array.isArray(supportTiers) || supportTiers.some(tier => !validateRequiredFields(tier, ['title', 'description']) || tier.cost === undefined || tier.cost < 0)) {
            respCustom(res, 400, "Bad Request").send();
            return;
        }
        if (supportTiers.length < 1 || supportTiers.length > 3) {
            respCustom(res, 400, "Bad Request").send();
            return;
        }
        const categories = await findAllCategories();
        if (!categories.some(category => category.id === categoryId)) {
            respCustom(res, 400, "Bad Request").send();
            return;
        }
        const isPetitionExist = await doesPetitionExistByTitle(title);
        if (isPetitionExist) {
            respCustom(res, 403, "Petition title already exists").send();
            return;
        }
        for (const tier of supportTiers) {
            if (isPetitionExist && await doesSupportTierExistByTitle(tier.title)) {
                respCustom(res, 400, `Support tier title '${tier.title}' already exists`).send();
                return;
            }
        }
        const creationDate = new Date();
        const petition: Petition = {
            title,
            description,
            creationDate,
            ownerId: req.userId,
            categoryId,
        };
        const newPetitionId = await addPetitionModel(petition);
        for (const tier of supportTiers) {
            tier.petition_id = newPetitionId;
            await addSupportTierData(tier);
        }
        respCustom(res, 201, "Created").json({petitionId: newPetitionId}).send();
        return;
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

const editPetition = async (req: Request, res: Response): Promise<void> => {
    try {
        const petitionId = parseInt(req.params.id, 10);
        if (isNaN(petitionId) || petitionId < 0) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }
        const petition = await findPetitionById(petitionId);
        if (!petition) {
            respCustom(res, 404, "No petition found with id").send();
            return;
        }
        if (petition.ownerId !== req.userId) {
            respCustom(res, 403, "Only the owner of a petition may change it").send();
            return;
        }
        const {title, description, categoryId} = req.body;
        if (title !== undefined && !validateEmailLength(title, 0, 80)) {
            respCustom(res, 400, "Bad Request").send();
            return;
        }
        if (title && await doesSupportTierExistByTitle(title)) {
            respCustom(res, 400, "Bad Request").send();
            return;
        }
        if (description === "") {
            respCustom(res, 400, "Bad Request").send();
            return;
        }
        const categories = await findAllCategories();
        if (categoryId && !categories.some(category => category.id === categoryId)) {
            respCustom(res, 400, "Bad Request").send();
            return;
        }
        const updatedPetition = {
            ...petition,
            title: title !== undefined ? title : petition.title,
            description: description !== undefined ? description : petition.description,
            categoryId: categoryId !== undefined ? categoryId : petition.categoryId,
        };
        await updatePetition(updatedPetition);
        respCustom(res, 200, "Petition updated").json({
            title: updatedPetition.title,
            description: updatedPetition.description,
            categoryId: updatedPetition.categoryId,
        }).send();
        return;
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

const deletePetition = async (req: Request, res: Response): Promise<void> => {
    try {
        const petitionId = parseInt(req.params.id, 10);
        if (isNaN(petitionId) || petitionId < 0) {
            respCustom(res, 400, "Invalid information").send();
            return;
        }
        const petitionsOne = await findPetitionById(petitionId);
        if (petitionsOne == null) {
            respCustom(res, 404, "No Found").send();
            return;
        }
        const supporters = await findAllSupporters();
        if (petitionsOne.ownerId !== req.userId) {
            respCustom(res, 403, "Only the owner of a petition may delete it").send();
            return;
        }
        if (supporters.length > 0) {
            respCustom(res, 403, "Can not delete a petition with one or more supporters").send();
            return;
        }
        await deletePetitionById(petitionsOne.petitionId);
        respCustom(res, 200, "Success").send();
        return;
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await findAllCategories();
        const result = categories.map(category => ({
            categoryId: category.id,
            name: category.name
        }));
        respCustom(res, 200, "OK").json(result).send();
        return;
    } catch (err) {
        Logger.error(err);
        respCustom(res, 500, "Internal Server Error").send();
        return;
    }
}

export {getAllPetitions, getPetition, addPetition, editPetition, deletePetition, getCategories};