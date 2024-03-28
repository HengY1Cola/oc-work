import Logger from '../../config/logger';
import {getPool} from "../../config/db";

interface Category {
    id: number;
    name: string;
}

const findAllCategories = async (): Promise<Category[]> => {
    const sql = 'SELECT * FROM `category` ORDER BY `id` ASC';
    try {
        const [rows] = await getPool().query(sql);
        return rows as Category[];
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

export {findAllCategories}