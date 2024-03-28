import crypto from 'crypto';
const hash = async (password: string): Promise<string> => {
    const salt = 'yli431';
    const hashData = crypto.createHash('md5').update(password + salt).digest('hex');
    return hashData.substring(0, 16);
}

const compare = async (password: string, comp: string): Promise<boolean> => {
    // Todo: (suggested) update this to compare the encrypted passwords
    return (password === comp)
}

export {hash, compare}