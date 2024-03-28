import Logger from '../../config/logger';
import {getPool} from "../../config/db";
import {SupportTier} from "./support_tier.model";

interface Petition {
    id?: number;
    title: string;
    description: string;
    creationDate: Date;
    imageFilename?: string | null;
    ownerId: number;
    categoryId: number;
    tierList?: SupportTier[]
    SupportingCost?: number
}

const findAllPetitions = async (): Promise<Petition[]> => {
    const sql = 'SELECT * FROM `petition` ORDER BY `creation_date` ASC';
    try {
        const [rows] = await getPool().query(sql);
        return rows as Petition[];
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const findPetitionById = async (id: number): Promise<Petition | null> => {
    const sql = 'SELECT * FROM `petition` WHERE `id` = ?';
    try {
        const [rows] = await getPool().query(sql, [id]);
        if (rows.length > 0) {
            return rows[0] as Petition;
        } else {
            return null;
        }
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const doesPetitionExistByTitle = async (title: string): Promise<boolean> => {
    const sql = 'SELECT 1 FROM `petition` WHERE `title` = ? LIMIT 1';
    try {
        const [rows] = await getPool().query(sql, [title]);
        return rows.length > 0;
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const addPetitionModel = async (petition: Petition): Promise<number> => {
    const sql = 'INSERT INTO `petition` (`title`, `description`, `creation_date`, `image_filename`, `owner_id`, `category_id`) VALUES (?, ?, ?, ?, ?, ?)';
    try {
        const [result] = await getPool().query(sql, [petition.title, petition.description, petition.creationDate, petition.imageFilename, petition.ownerId, petition.categoryId]);
        return result.insertId;
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const updatePetition = async (petition: Petition): Promise<void> => {
    const sql = 'UPDATE `petition` SET `title` = ?, `description` = ?, `creation_date` = ?, `image_filename` = ?, `owner_id` = ?, `category_id` = ? WHERE `id` = ?';
    try {
        await getPool().query(sql, [petition.title, petition.description, petition.creationDate, petition.imageFilename, petition.ownerId, petition.categoryId, petition.id]);
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const deletePetitionById = async (id: number): Promise<void> => {
    const sql = 'DELETE FROM `petition` WHERE `id` = ?';
    try {
        await getPool().query(sql, [id]);
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

export {
    Petition,
    findAllPetitions,
    findPetitionById,
    doesPetitionExistByTitle,
    addPetitionModel,
    updatePetition,
    deletePetitionById,
}