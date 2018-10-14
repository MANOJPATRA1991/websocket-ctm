import { Message } from './models/message';
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import * as http from 'http';
import * as socketio from 'socket.io';

import createError = require('http-errors');
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");

import { IndexRoute } from './routes';
import { UserRoute } from './routes/users';
import { CTMRoute } from './routes/ctm';

/**
 * The server.
 *
 * @class Server
 */
export class Server {

  public app: express.Application;
  public httpServer: http.Server;
  public io: socketio.Socket;

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

    this.httpServer = new http.Server(this.app);
    this.configSocket(this.httpServer);

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
    console.log("config socket");
    this.io = require('socket.io')(server);
    
    this.io.on('connection', function(socket: any){
      // Whenever user connects
      console.log('user connected');

      // Log whenever a client disconnects from our websocket server
      socket.on('disconnect', function(){
          console.log('user disconnected');
      });

      // When we receive a 'message' event from our client, print out
      // the contents of that message and then echo it back to our client
      // using `io.emit()`
      socket.on('message', (msg: string) => {
        const message = JSON.parse(msg) as Message;
        console.log("Message Received: " + message);
        setTimeout(() => {
          if (message.isBroadcast) {
            this.io.emit(Server.createMessage(message.content, true, message.sender));
          }
        });
      });
    });
  }

  public static createMessage(content: string, isBroadcast = false, sender = 'NS'): string {
    return JSON.stringify(new Message(content, isBroadcast, sender));
  }
}