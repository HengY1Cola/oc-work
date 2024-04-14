import React from "react";
import restful from "../api/rustful";

function Api() {
    function getApi() {
        restful.get('/api/hello').then(r => console.log(r))
    }

    function getApi2() {
        restful.get('/api/hello', {aaa: "1111"}).then(r => console.log(r))
    }

    getApi();
    getApi2()

    return <>
        Hello World
    </>;
}

export default Api;