"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const message_1 = require("./models/message");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const logger = require("morgan");
const path = require("path");
const http = require("http");
const SocketServer = require("ws");
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
        this.users = {};
        this.app = express();
        this.httpServer = new http.Server(this.app);
        this.wss = new SocketServer.Server({ server: this.httpServer });
        this.config();
        this.configSocket();
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
        ctm_1.CTMRoute.create(router, this.wss, this.users);
        this.app.use(router);
    }
    configSocket() {
        this.wss.on('open', () => {
            console.log('You are logged');
        });
        this.wss.on('connection', (ws) => {
            console.log('live');
            const extWs = ws;
            console.log(this.wss.clients);
            extWs.isAlive = true;
            ws.on('pong', () => {
                extWs.isAlive = true;
            });
            ws.on('message', (msg) => {
                const message = JSON.parse(msg);
                setTimeout(() => {
                    ws.send(this.createMessage(`You sent -> ${message.content}`, message.isBroadcast));
                }, 1000);
                this.users[message.sender] = extWs;
            });
            ws.send(this.createMessage('Hi there, I am a WebSocket server'));
        });
    }
    createMessage(content, isBroadcast = false, sender = 'NS') {
        return JSON.stringify(new message_1.Message(content, isBroadcast, sender));
    }
}
exports.Server = Server;
