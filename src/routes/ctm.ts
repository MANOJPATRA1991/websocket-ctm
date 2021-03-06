import { Constants } from './../models/constants';
import { Message } from './../models/message';
import { NextFunction, Request, Response, Router } from "express";
import * as SocketServer from 'ws';
import fetch from 'node-fetch';
let base64 = require('base-64');

export class CTMRoute {
    constructor() { }

    public static create(router: Router, wss: SocketServer.Server, users: any) {
        router.post("/ctm", (req: Request, res: Response, next: NextFunction) => {
            console.log(req.body);
            let call_log = req.body;

            console.log(users);

            if (users[call_log.agent.email]) {
                users[call_log.agent.email].send(JSON.stringify(new Message(JSON.stringify(call_log), false, 'CTM')));
            } else {
                let url = `https://api.calltrackingmetrics.com/api/v1/accounts/${Constants.account_id}/calls/${call_log.id}/endcall`;
                let username = Constants.account_username;
                let password = Constants.account_password;

                // let headers = new Headers();

                // headers.set('Authorization', 'Basic ' + base64.encode(username + ":" + password));
                // headers.append("Content-Type", "application/json; charset=utf-8");

                fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                        'Authorization': 'Basic ' + base64.encode(username + ":" + password)
                    }
                })
                .then(response => {
                    console.log(response.json());

                    return response.json();
                })
                .then(d => console.log(d));
            }

            res.status(200).json({
                data: req.body
            });
        });
    }
}
