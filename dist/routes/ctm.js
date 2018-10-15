"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./../models/constants");
const message_1 = require("./../models/message");
let base64 = require('base-64');
class CTMRoute {
    constructor() { }
    static create(router, wss, users) {
        router.post("/ctm", (req, res, next) => {
            console.log(req.body);
            let call_log = req.body;
            console.log(users);
            if (users[call_log.agent.email]) {
                users[call_log.agent.email].send(JSON.stringify(new message_1.Message(JSON.stringify(call_log), false, 'CTM')));
            }
            else {
                let url = `https://api.calltrackingmetrics.com/api/v1/accounts/${constants_1.Constants.account_id}/calls/${call_log.id}/endcall`;
                let username = constants_1.Constants.account_username;
                let password = constants_1.Constants.account_password;
                let headers = new Headers();
                headers.set('Authorization', 'Basic ' + base64.encode(username + ":" + password));
                headers.append("Content-Type", "application/json; charset=utf-8");
                fetch(url, {
                    method: "POST",
                    mode: "cors",
                    cache: "no-cache",
                    credentials: "same-origin",
                    headers: headers,
                    redirect: "follow",
                    referrer: "no-referrer",
                    body: JSON.stringify({})
                })
                    .then(response => {
                    console.log(response.json());
                });
            }
            res.status(200).json({
                data: req.body
            });
        });
    }
}
exports.CTMRoute = CTMRoute;
