"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const message_1 = require("./models/message");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const logger = require("morgan");
const path = require("path");
const http = require("http");
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
        this.httpServer = new http.Server(this.app);
        this.configSocket(this.httpServer);
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
        this.io = require('socket.io')(server);
        this.io.on('connection', function (socket) {
            console.log('user connected');
            socket.on('disconnect', function () {
                console.log('user disconnected');
            });
            socket.on('message', (msg) => {
                const message = JSON.parse(msg);
                console.log("Message Received: " + message);
                setTimeout(() => {
                    if (message.isBroadcast) {
                        this.io.emit(Server.createMessage(message.content, true, message.sender));
                    }
                });
            });
        });
    }
    static createMessage(content, isBroadcast = false, sender = 'NS') {
        return JSON.stringify(new message_1.Message(content, isBroadcast, sender));
    }
}
exports.Server = Server;
