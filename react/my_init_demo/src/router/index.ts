import { createHashRouter } from "react-router-dom";
import Atd from "../pages/antd";
import Api from "../pages/api";
import redux from "../pages/redux";
import storage from "../pages/storage";
import Home from "../pages/home";

const router = createHashRouter([
    {
        path: "/",
        Component: Home,
    },
    {
        path: "/antd",
        Component: Atd,
    },
    {
        path: "/api",
        Component: Api,
    },
    {
        path: "/redux",
        Component: redux,
    },
    {
        path: "/storage",
        Component: storage,
    },
]);

export default router;