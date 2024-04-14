import request from "./index";
import {stringifyWithTrim} from "../utils/request";

export default class restful {

    static get(url: string, query: object = {}) {
        const queryStr = stringifyWithTrim(query)
        const requestUrl = queryStr === "" ? url : `${url}?${queryStr}`
        return request(requestUrl)
    }
}