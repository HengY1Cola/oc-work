import Logger from '../../config/logger';
import {getPool} from "../../config/db";
import {Supporter} from "./supporter.model";


interface SupportTier {
    id?: number;
    petition_id: number;
    title: string;
    description: string;
    cost: number;
    supporterList?: Supporter[]
}

const findAllSupportTiers = async (): Promise<SupportTier[]> => {
    const sql = 'SELECT * FROM `support_tier`';
    try {
        const [rows] = await getPool().query(sql);
        return rows as SupportTier[];
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const findSupportTiersByPetitionId = async (petitionId: number): Promise<SupportTier[]> => {
    const sql = 'SELECT * FROM `support_tier` WHERE `petition_id` = ?';
    try {
        const [rows] = await getPool().query(sql, [petitionId]);
        return rows as SupportTier[];
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const findSupportTierById = async (id: number): Promise<SupportTier | null> => {
    const sql = 'SELECT * FROM `support_tier` WHERE `id` = ?';
    try {
        const [rows] = await getPool().query(sql, [id]);
        if (rows.length > 0) {
            return rows[0] as SupportTier;
        } else {
            return null;
        }
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const doesSupportTierExistByTitle = async (title: string): Promise<boolean> => {
    const sql = 'SELECT 1 FROM `support_tier` WHERE `title` = ? LIMIT 1';
    try {
        const [rows] = await getPool().query(sql, [title]);
        return rows.length > 0;
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const addSupportTierData = async (supportTier: SupportTier): Promise<number> => {
    const sql = 'INSERT INTO `support_tier` (`petition_id`, `title`, `description`, `cost`) VALUES (?, ?, ?, ?)';
    try {
        const [result] = await getPool().query(sql, [supportTier.petition_id, supportTier.title, supportTier.description, supportTier.cost]);
        return result.insertId;
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const updateSupportTier = async (supportTier: SupportTier): Promise<void> => {
    const sql = 'UPDATE `support_tier` SET `title` = ?, `description` = ?, `cost` = ? WHERE `id` = ?';
    try {
        await getPool().query(sql, [supportTier.title, supportTier.description, supportTier.cost, supportTier.id]);
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const deleteSupportTierById = async (id: number): Promise<void> => {
    const sql = 'DELETE FROM `support_tier` WHERE `id` = ?';
    try {
        await getPool().query(sql, [id]);
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

export {
    SupportTier,
    findAllSupportTiers,
    findSupportTiersByPetitionId,
    findSupportTierById,
    doesSupportTierExistByTitle,
    addSupportTierData,
    updateSupportTier,
    deleteSupportTierById,
}