import { NextFunction, Request, Response, Router } from "express";
import * as SocketServer from 'ws';

export class CTMRoute {
    constructor() { }

    public static create(router: Router, wss: SocketServer.Server, users: any) {
        router.post("/ctm", (req: Request, res: Response, next: NextFunction) => {
            console.log(req.body);
            let call_log = req.body;

            console.log(users);

            if (users[call_log.agent.email]) {
                users[call_log.agent.email].emit('call_started', JSON.stringify(call_log));
            }

            res.status(200).json({
                data: req.body
            });
        });
    }
}
