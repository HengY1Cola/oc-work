import Logger from '../../config/logger';
import {getPool} from "../../config/db";

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    image_filename?: string;
    password: string;
    auth_token?: string;
}

const findUserByEmail = async (email: string): Promise<User | null> => {
    const sql = 'SELECT * FROM `user` WHERE `email` = ?';
    try {
        const [rows] = await getPool().query(sql, [email]);
        if (rows.length > 0) {
            return rows[0] as User;
        } else {
            return null;
        }
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const isUserExistsByEmail = async (email: string): Promise<boolean> => {
    try {
        const user = await findUserByEmail(email);
        return user !== null;
    } catch (err) {
        Logger.error(err);
        throw err;
    }
};

const createUser = async (user: {
    email: string;
    first_name: string;
    last_name: string;
    password: string
}): Promise<number> => {
    const sql = 'INSERT INTO `user` (`email`, `first_name`, `last_name`, `password`) VALUES (?, ?, ?, ?)';
    try {
        const [result] = await getPool().query(sql, [user.email, user.first_name, user.last_name, user.password]);
        return result.insertId;
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};


const findAuthTokenById = async (id: number): Promise<string | null> => {
    const sql = 'SELECT `auth_token` FROM `user` WHERE `id` = ?';
    try {
        const [rows] = await getPool().query(sql, [id]);
        if (rows.length > 0) {
            return rows[0].auth_token;
        } else {
            return null;
        }
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const updateAuthTokenById = async (id: number, authToken: string): Promise<void> => {
    const sql = 'UPDATE `user` SET `auth_token` = ? WHERE `id` = ?';
    try {
        const [result] = await getPool().query(sql, [authToken, id]);
        if (result.affectedRows === 0) {
            throw new Error('user not found');
        }
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const findUserById = async (id: number): Promise<User | null> => {
    const sql = 'SELECT * FROM `user` WHERE `id` = ?';
    try {
        const [rows] = await getPool().query(sql, [id]);
        if (rows.length > 0) {
            return rows[0] as User;
        } else {
            return null;
        }
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const updateUser = async (updatedUser: User): Promise<boolean> => {
    const sql = `UPDATE \`user\`
                 SET \`email\`      = ?,
                     \`first_name\` = ?,
                     \`last_name\`  = ?,
                     \`password\`   = ?
                     WHERE \`id\` = ?;`;
    try {
        await getPool().query(sql, [
            updatedUser.email,
            updatedUser.first_name,
            updatedUser.last_name,
            updatedUser.password,
            updatedUser.id
        ]);
        return true
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

const updateImageFilenameById = async (id: number, filename: string): Promise<boolean> => {
    const userExists = await findUserById(id);
    if (!userExists) {
        throw new Error('User not found');
    }

    // 更新用户的image_filename字段
    const sql = 'UPDATE `user` SET `image_filename` = ? WHERE `id` = ?';
    try {
        const [result] = await getPool().query(sql, [filename, id]);
        return result.affectedRows > 0;
    } catch (err) {
        Logger.error(err.sql);
        throw err;
    }
};

export {
    User,
    findUserByEmail,
    isUserExistsByEmail,
    createUser,
    findAuthTokenById,
    updateAuthTokenById,
    findUserById,
    updateUser,
    updateImageFilenameById
}