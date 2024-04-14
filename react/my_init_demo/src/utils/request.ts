import {stringify} from "qs";

export function stringifyWithTrim(params = {}) {
    function encoder(str:unknown, defaultEncoder:(str: unknown, defaultEncoder?: unknown, charset?: string) => string) {
        if (typeof str === "string") {
            return defaultEncoder(str.trim());
        }
        return defaultEncoder(str);
    }
    return stringify(params, { encoder });
}