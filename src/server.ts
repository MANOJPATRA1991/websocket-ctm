import { Message } from './models/message';
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import * as http from 'http';
import * as WebSocket from 'ws';

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
  public wss: WebSocket.Server;

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
    this.app = express();
    this.httpServer = undefined;
    this.wss = undefined;

    //configure application
    this.config();

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
    CTMRoute.create(router);

    this.app.use(router);
  }

  public configSocket(server) {
    this.wss = new WebSocket.Server({ server });
    
    this.wss.on('open', () => {
      console.log('You are logged');
    });
    
    console.log(this.wss);
    
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('live');
      const extWs = ws as ExtWebSocket;
  
      extWs.isAlive = true;
  
      ws.on('pong', () => {
          extWs.isAlive = true;
      });
  
      //connection is up, let's add a simple simple event
      ws.on('message', (msg: string) => {
  
          const message = JSON.parse(msg) as Message;
  
          setTimeout(() => {
              if (message.isBroadcast) {
                //send back the message to the other clients
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
  
      //send immediatly a feedback to the incoming connection    
      ws.send(this.createMessage('Hi there, I am a WebSocket server'));
  
      ws.on('error', (err) => {
          console.warn(`Client disconnected - reason: ${err}`);
      })
    });
    
    setInterval(() => {
      this.wss.clients.forEach((ws: WebSocket) => {
        const extWs = ws as ExtWebSocket;

        if (!extWs.isAlive) return ws.terminate();

        extWs.isAlive = false;
        ws.ping(null, undefined);
      });
    }, 10000);
  }

  public createMessage(content: string, isBroadcast = false, sender = 'NS'): string {
    return JSON.stringify(new Message(content, isBroadcast, sender));
  }
}