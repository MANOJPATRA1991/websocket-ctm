"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const message_1 = require("./models/message");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const logger = require("morgan");
const path = require("path");
const WebSocket = require("ws");
const errorHandler = require("errorhandler");
const methodOverride = require("method-override");
const routes_1 = require("./routes");
const users_1 = require("./routes/users");
const ctm_1 = require("./routes/ctm");
class Server {
    static bootstrap() {
        return new Server();
    }
    constructor() {
        this.app = express();
        this.httpServer = undefined;
        this.wss = undefined;
        this.config();
        this.routes();
        this.api();
    }
    api() {
    }
    config() {
        this.app.use(express.static(path.join(__dirname, "public")));
        this.app.set("views", path.join(__dirname, "views"));
        this.app.set("view engine", "ejs");
        this.app.use(logger("dev"));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
        this.app.use(cookieParser("SECRET_GOES_HERE"));
        this.app.use(methodOverride());
        this.app.use(function (err, req, res, next) {
            err.status = 404;
            next(err);
        });
        this.app.use(errorHandler());
    }
    routes() {
        let router = express.Router();
        routes_1.IndexRoute.create(router);
        users_1.UserRoute.create(router);
        ctm_1.CTMRoute.create(router);
        this.app.use(router);
    }
    configSocket(server) {
        this.wss = new WebSocket.Server({ server });
        this.wss.on('open', () => {
            console.log('You are logged');
        });
        console.log(this.wss);
        this.wss.on('connection', (ws) => {
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
                        this.wss.clients
                            .forEach(client => {
                            if (client != ws) {
                                client.send(this.createMessage(message.content, true, message.sender));
                            }
                        });
                    }
                    ws.send(this.createMessage(`You sent -> ${message.content}`, message.isBroadcast));
                }, 1000);
            });
            ws.send(this.createMessage('Hi there, I am a WebSocket server'));
            ws.on('error', (err) => {
                console.warn(`Client disconnected - reason: ${err}`);
            });
        });
        setInterval(() => {
            this.wss.clients.forEach((ws) => {
                const extWs = ws;
                if (!extWs.isAlive)
                    return ws.terminate();
                extWs.isAlive = false;
                ws.ping(null, undefined);
            });
        }, 10000);
    }
    createMessage(content, isBroadcast = false, sender = 'NS') {
        return JSON.stringify(new message_1.Message(content, isBroadcast, sender));
    }
}
exports.Server = Server;
