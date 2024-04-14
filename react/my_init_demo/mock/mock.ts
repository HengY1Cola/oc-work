import { MockMethod } from 'vite-plugin-mock';

export default [
    {
        url: '/api/hello',
        method: 'get',
        timeout: Math.floor(Math.random() * (800 + 1)),
        response: () => {
            return {
                code: 0,
                message: 'success',
                data: {
                    data: "world"
                }
            };
        }
    }
] as MockMethod[];