import { Url } from "url";
import * as path from "path";
import { ILogger, LogManager } from "./logger";
import * as express from "express";

import * as stoppable from "stoppable";
import { authorizeMultipleUsers } from "./routes/selectUsers";
import { IUserStore } from "./local-store";

interface IConfig {
  port: number;
  host: string;
}

export class App {
  private readonly logger: ILogger;
  private app: any;
  private server: any;

  constructor(private userStore: IUserStore, private config: IConfig, packageVersion: string, repoUrl: string) {
    this.logger = LogManager.getLogger(__filename);

    this.app = express();

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.set("view engine", "ejs");
    const staticDir = path.join(__dirname + "/../../public");
    this.logger.debug(`staticDir is ${staticDir}`);
    this.app.use(express.static(staticDir));

    this.setupRoutes();
  }

  private setupRoutes() {
    this.logger.debug("setup routes");
    this.app.get("/o/authorize", authorizeMultipleUsers);
  }

  start(): Promise<any> {
    const logger = this.logger;
    return new Promise((resolve, reject) => {
      const httpServer = this.app.listen(this.config.port, (err) => {
        if (err) {
          logger.error(err);
          reject(err);
          return;
        }
        logger.info(`started on ${this.config.host}:${this.config.port}`);
        resolve({});
      });

      this.server = stoppable(httpServer, 0);
    });
  }

  stop(): Promise<any> {
    if (!this.server.listening) {
      this.logger.debug("server not listening!");
      return Promise.resolve();
    }

    const logger = this.logger;
    return new Promise((resolve, reject) => {
      // https://stackoverflow.com/a/36830072/155965
      this.server.stop(function (err) {
        if (err) {
          reject(err);
          return;
        }

        logger.debug("server.close ok");
        resolve(undefined);
      });
    });
  }
}

// const url = require("url");
// const path = require("path");
// const stoppable = require("stoppable");
// const logger = require("./logger")(__filename);
// const express = require("express");

// function App(config, versionInfo, repoUrl) {
//   if (typeof config === "undefined") throw Error("config is required");
//   if (!versionInfo) versionInfo = "";
//   if (!repoUrl) repoUrl = "";

//   function makeRedirectUrl(originalRedirectUri, state) {
//     logger.debug(originalRedirectUri);
//     const parsedUrl = url.parse(originalRedirectUri);
//     const redirectTo = url.format({
//       protocol: parsedUrl.protocol,
//       host: parsedUrl.host,
//       query: {
//         code: "abcdef",
//         state: state,
//         redirect_uri: originalRedirectUri,
//       },
//       pathname: parsedUrl.pathname,
//     });

//     logger.debug(redirectTo);
//     return redirectTo;
//   }

//   function selectFromMultipleUsers(req, res) {
//     logger.debug(req.body);
//     const emailUserId = req.body.email_user_id;
//     const redirectUri = req.body.redirectUri;

//     const user = config.users.find((u) => {
//       return u.email_user_id == emailUserId;
//     });

//     if (!user) {
//       res.status(500).send(`User ${emailUserId} has gone missing`);
//       return;
//     }

//     config.user = user;
//     logger.info(`setting user to ${user.email_user_id}`);
//     logger.debug(redirectUri);

//     res.redirect(redirectUri);
//   }

//   function token(req, res) {
//     logger.info(`${req.method} ${req.originalUrl}`);
//     res.status(200).send({
//       access_token: req.body.code,
//       token_type: "Bearer",
//     });
//   }

//   function user(req, res) {
//     logger.info(`${req.method} ${req.originalUrl}`);
//     const response = config.user;
//     res.status(200).send(response);
//   }

//   function introspect(req, res) {
//     logger.info(`${req.method} ${req.originalUrl}`);
//     const response = {
//       scope: config.scope,
//       active: true,
//       exp: 2524608000,
//       username: config.username,
//     };

//     return res.status(200).send(response);
//   }

//   const app = express();
//   let server;
//   logger.debug(config);

//   app.use(express.json());
//   app.use(express.urlencoded({ extended: true }));

//   app.use((req, res, next) => {
//     logger.debug(`${req.method} ${req.url}`);
//     next();
//   });

//   app.set("view engine", "ejs");
//   logger.debug("using ejs for views");
//   app.set("views", path.join(__dirname + "/../views"));
//   app.use(express.static(path.join(__dirname + "/../public")));

//   const authorizeUrl = "/o/authorize";
//   logger.info("authorize for multiple");
//   app.get(authorizeUrl, authorizeMultipleUsers);
//   app.post("/select-user", selectFromMultipleUsers);
//   app.post("/o/token", token);
//   app.get("/api/v1/user/me", user);
//   app.post("/o/introspect/", introspect);

//   app.all("*", (req, res) => {
//     logger.error(`404 ${req.method} ${req.originalUrl}`);
//     res.json({});
//   });

//   function start() {
//     return new Promise((resolve, reject) => {
//       const httpServer = app.listen(config.port, (err) => {
//         if (err) {
//           logger.error(err);
//           reject(err);
//           return;
//         }
//         logger.info(`started on ${config.host}:${config.port}`);
//         resolve();
//       });

//       server = stoppable(httpServer, 0);
//     });
//   }

//   return {
//     start: start,
//     stop: stop,
//   };
// }

// module.exports = App;
