import Logger from '../../config/logger';
import {getPool} from "../../config/db";

interface Supporter {
    id?: number;
    petitionId: number;
    supportTierId: number;
    userId: number;
    message: string | null;
    timestamp: Date;
}

const findAllSupporters = async (): Promise<Supporter[]> => {
    const sql = 'SELECT * FROM `supporter`';
    try {
        const [rows] = await getPool().query(sql);
        return rows as Supporter[];
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const findSupportersByPetitionId = async (petitionId: number): Promise<Supporter[]> => {
    const sql = 'SELECT * FROM `supporter` WHERE `petition_id` = ?';
    try {
        const [rows] = await getPool().query(sql, [petitionId]);
        return rows as Supporter[];
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const findSupporterById = async (id: number): Promise<Supporter | null> => {
    const sql = 'SELECT * FROM `supporter` WHERE `id` = ?';
    try {
        const [rows] = await getPool().query(sql, [id]);
        if (rows.length > 0) {
            return rows[0] as Supporter;
        } else {
            return null;
        }
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const doesSupporterExistBySupportTier = async (supportTierId: number): Promise<boolean> => {
    const sql = 'SELECT 1 FROM `supporter` WHERE `support_tier_id` = ?  LIMIT 1';
    try {
        const [rows] = await getPool().query(sql, [supportTierId]);
        return rows.length > 0;
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const addSupporterData = async (supporter: Supporter): Promise<number> => {
    const sql = 'INSERT INTO `supporter` (`petition_id`, `support_tier_id`, `user_id`, `message`, `timestamp`) VALUES (?, ?, ?, ?, ?)';
    try {
        const [result] = await getPool().query(sql, [supporter.petitionId, supporter.supportTierId, supporter.userId, supporter.message, supporter.timestamp]);
        return result.insertId;
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const updateSupporter = async (supporter: Supporter): Promise<void> => {
    const sql = 'UPDATE `supporter` SET `message` = ?, `timestamp` = ? WHERE `id` = ?';
    try {
        await getPool().query(sql, [supporter.message, supporter.timestamp, supporter.id]);
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const deleteSupporterById = async (id: number): Promise<void> => {
    const sql = 'DELETE FROM `supporter` WHERE `id` = ?';
    try {
        await getPool().query(sql, [id]);
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

export {
    Supporter,
    findAllSupporters,
    findSupportersByPetitionId,
    findSupporterById,
    doesSupporterExistBySupportTier,
    addSupporterData,
    updateSupporter,
    deleteSupporterById
}