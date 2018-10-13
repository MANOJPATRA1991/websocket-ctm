"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IndexRoute {
    constructor() { }
    static create(router) {
        router.get("/", (req, res, next) => {
            res.render('index', { title: 'Express' });
        });
    }
}
exports.IndexRoute = IndexRoute;
