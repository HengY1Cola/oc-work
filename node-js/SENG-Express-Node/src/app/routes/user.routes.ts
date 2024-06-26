import {Express} from "express";
import {rootUrl} from "./base.routes";
import * as user from '../controllers/user.controller';
import * as userImages from '../controllers/user.image.controller';
import {authenticate} from "../middleware/cors.middleware";

module.exports = (app: Express) => {
    app.route(rootUrl+'/users/register')
        .post(user.register);

    app.route(rootUrl+'/users/login')
        .post(user.login);

    app.route(rootUrl+'/users/logout')
        .post(authenticate, user.logout);

    app.route(rootUrl+'/users/:id')
        .get(user.view)
        .patch(authenticate, user.update);

    app.route(rootUrl+'/users/:id/image')
        .get(userImages.getImage)
        .put(authenticate, userImages.setImage)
        .delete(authenticate, userImages.deleteImage)
}