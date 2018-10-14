"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const message_1 = require("../models/message");
class WS {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.configSocket(this.wss);
    }
    static bootstrap(server) {
        return new WS(server);
    }
    configSocket(wss) {
        console.log(this.wss);
        wss.on('open', () => {
            console.log('You are logged');
        });
        wss.on('connection', (ws) => {
            console.log('live');
            const extWs = ws;
            extWs.isAlive = true;
            ws.on('pong', () => {
                extWs.isAlive = true;
            });
            ws.on('message', (msg) => {
                const message = JSON.parse(msg);
                setTimeout(() => {
                    if (message.isBroadcast) {
                        wss.clients
                            .forEach(client => {
                            if (client != ws) {
                                client.send(WS.createMessage(message.content, true, message.sender));
                            }
                        });
                    }
                    ws.send(WS.createMessage(`You sent -> ${message.content}`, message.isBroadcast));
                }, 1000);
            });
            ws.send(WS.createMessage('Hi there, I am a WebSocket server'));
            ws.on('error', (err) => {
                console.warn(`Client disconnected - reason: ${err}`);
            });
        });
        setInterval(() => {
            wss.clients.forEach((ws) => {
                const extWs = ws;
                if (!extWs.isAlive)
                    return ws.terminate();
                extWs.isAlive = false;
                ws.ping(null, undefined);
            });
        }, 10000);
    }
    static createMessage(content, isBroadcast = false, sender = 'NS') {
        return JSON.stringify(new message_1.Message(content, isBroadcast, sender));
    }
}
exports.WS = WS;
