import { NextFunction, Request, Response, Router } from "express";
import * as SocketServer from 'ws';

export class CTMRoute {
    constructor() { }

    public static create(router: Router, wss: SocketServer.Server) {
        router.post("/ctm", (req: Request, res: Response, next: NextFunction) => {
            console.log(req.body);
            console.log(wss);
            let call_log = req.body;

            res.status(200).json({
                data: req.body
            });
        });
    }
}
