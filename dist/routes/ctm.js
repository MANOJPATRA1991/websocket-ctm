"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CTMRoute {
    constructor() { }
    static create(router) {
        router.post("/ctm", (req, res, next) => {
            console.log(req.body);
            res.status(200).json({
                data: req.body
            });
        });
    }
}
exports.CTMRoute = CTMRoute;
