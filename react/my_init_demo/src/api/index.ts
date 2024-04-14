import { extend, type ResponseError } from "umi-request";
import { message } from "antd";

const errorHandler = (
    err: ResponseError & {
        code?: number;
        message?: string;
    }
) => {
    message.destroy();
    message.error(err.message || "server error, try again later");
    return {
        code: err.code,
        message: err.message || "server error, try again later",
        data: {}
    };
};

const Request = extend({
    timeout: 30000,
    errorHandler,
});

Request.interceptors.request.use((url) => {
    return {
        url,
    };
});

Request.interceptors.response.use((response) => {
    return new Promise(function (resolve, reject) {
        response.text().then((res) => {
            let resData;
            try {
                resData = JSON.parse(res);
            } catch (err) {
                resData = {
                    code: 1000,
                    message: "data syntax error",
                    data: {}
                };
            }
            if (resData.code === 0) {
                resolve(resData);
            } else {
                reject(resData);
            }
        });
    });
});

export default Request;