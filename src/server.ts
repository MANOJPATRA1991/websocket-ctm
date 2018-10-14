import { Message } from './models/message';
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import * as http from 'http';
import * as SocketServer from 'ws';

import createError = require('http-errors');
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");

import { IndexRoute } from './routes';
import { UserRoute } from './routes/users';
import { CTMRoute } from './routes/ctm';

import ExtWebSocket from './models/extWebSocket';


/**
 * The server.
 *
 * @class Server
 */
export class Server {

  public app: express.Application;
  public httpServer: http.Server;
  public wss: SocketServer.Server;
  public users: any;

  /**
   * Bootstrap the application.
   *
   * @class Server
   * @method bootstrap
   * @static
   * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
   */
  public static bootstrap(): Server {
    return new Server();
  }

  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor() {
    //create expressjs application
    this.users = {};

    this.app = express();
    this.httpServer = new http.Server(this.app);
    this.wss = new SocketServer.Server({ server: this.httpServer });

    //configure application
    this.config();

    this.configSocket();

    //add routes
    this.routes();

    //add api
    this.api();
  }

  /**
   * Create REST API routes
   *
   * @class Server
   * @method api
   */
  public api() {
    //empty for now
  }

  /**
   * Configure application
   *
   * @class Server
   * @method config
   */
  public config() {
    //add static paths
    this.app.use(express.static(path.join(__dirname, "public")));

    //configure pug
    this.app.set("views", path.join(__dirname, "views"));
    this.app.set("view engine", "ejs");

    //use logger middlware
    this.app.use(logger("dev"));

    //use json form parser middlware
    this.app.use(bodyParser.json());

    //use query string parser middlware
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));

    //use cookie parser middleware
    this.app.use(cookieParser("SECRET_GOES_HERE"));

    //use override middlware
    this.app.use(methodOverride());

    //catch 404 and forward to error handler
    this.app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
        err.status = 404;
        next(err);
    });

    //error handling
    this.app.use(errorHandler());
  }

  /**
   * Create router
   *
   * @class Server
   * @method api
   */
  public routes() {
    let router: express.Router = express.Router();

    IndexRoute.create(router);
    UserRoute.create(router);
    CTMRoute.create(router, this.wss, this.users);

    this.app.use(router);
  }

  public configSocket() {
    this.wss.on('open', () => {
      console.log('You are logged');
    });
    
    this.wss.on('connection', (ws: SocketServer) => {
      console.log('live');
      const extWs = ws as ExtWebSocket;
      console.log(this.wss.clients);
      extWs.isAlive = true;
  
      ws.on('pong', () => {
          extWs.isAlive = true;
      });
  
      //connection is up, let's add a simple simple event
      ws.on('message', (msg: string) => {
  
          const message = JSON.parse(msg) as Message;
  
          setTimeout(() => {
              ws.send(this.createMessage(`You sent -> ${message.content}`, message.isBroadcast));
          }, 1000);

          this.users[message.sender] = extWs;
  
      });
  
      //send immediatly a feedback to the incoming connection    
      ws.send(this.createMessage('Hi there, I am a WebSocket server'));
    });
  }

  public createMessage(content: string, isBroadcast = false, sender = 'NS'): string {
    return JSON.stringify(new Message(content, isBroadcast, sender));
  }
}