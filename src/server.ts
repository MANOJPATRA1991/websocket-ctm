import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import * as http from 'http';

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
    // import socketIO = require('socket.io')(this.httpServer);

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
}

// var app = express();

// io.on('connection', function(socket){
//   // Whenever user connects
//   console.log('user connected');

//   // Log whenever a client disconnects from our websocket server
//   socket.on('disconnect', function(){
//       console.log('user disconnected');
//   });

//   // When we receive a 'message' event from our client, print out
//   // the contents of that message and then echo it back to our client
//   // using `io.emit()`
//   socket.on('message', (message) => {
//       console.log("Message Received: " + message);
//       io.emit('message', {type:'new-message', text: message});    
//   });
// });

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// app.use('/ctm', ctmRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;
 