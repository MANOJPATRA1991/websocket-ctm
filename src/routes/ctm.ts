import { NextFunction, Request, Response, Router } from "express";

export class CTMRoute {
    constructor() { }

    public static create(router: Router) {
        router.post("/ctm", (req: Request, res: Response, next: NextFunction) => {
            console.log(req.body);
            res.status(200).json({
                data: req.body
            });
        });
    }
}
