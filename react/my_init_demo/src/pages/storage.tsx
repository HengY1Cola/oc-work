import React from "react";
import {useStorage} from "web-localstorage-plus";

function Storage() {
    const storage = useStorage();
    storage.setItem("age", 18, "author");
    return <>learn storage</>;
}

export default Storage;