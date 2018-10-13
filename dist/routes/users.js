"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserRoute {
    constructor() { }
    static create(router) {
        router.get("/users", (req, res, next) => {
            res.send('respond with a resource');
        });
    }
}
exports.UserRoute = UserRoute;
