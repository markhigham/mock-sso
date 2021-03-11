import { Url } from "url";
import * as path from "path";
import { ILogger, LogManager } from "./logger";
import * as express from "express";
import * as cookieParser from "cookie-parser";

import * as stoppable from "stoppable";
import { AuthorizeUserRoutes } from "./routes/authorize";
import { IAuthenticatedUserStore, IUserStore } from "./data/interfaces";
import { IConfig } from "../config";
import { TokenRoutes } from "./routes/token";
import { UserRoutes } from "./routes/user";

export class App {
  private readonly logger: ILogger;
  private app: any;
  private server: any;

  constructor(private userStore: IUserStore, private authenticatedUserStore: IAuthenticatedUserStore, private config: IConfig) {
    this.logger = LogManager.getLogger(__filename);

    this.app = express();

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(cookieParser(config.secret));

    this.app.set("view engine", "ejs");
    const staticDir = path.join(__dirname + "/../../public");
    this.logger.debug(`staticDir is ${staticDir}`);
    this.app.use(express.static(staticDir));

    this.setupRoutes();
  }

  private setupRoutes() {
    this.logger.debug("setup routes");
    const authRoutes = new AuthorizeUserRoutes(this.userStore, this.authenticatedUserStore, this.config);
    this.app.get("/o/authorize", authRoutes.get.bind(authRoutes));
    this.app.post("/select-user", authRoutes.post.bind(authRoutes));
    this.app.post("/create-user", authRoutes.create.bind(authRoutes));

    const tokenRoutes = new TokenRoutes();
    this.app.post("/o/token", tokenRoutes.post.bind(tokenRoutes));

    const userRoutes = new UserRoutes(this.authenticatedUserStore, this.config);
    this.app.get("/api/v1/user/me", userRoutes.user.bind(userRoutes));
    this.app.post("/o/introspect/", userRoutes.introspect.bind(userRoutes));

    this.app.get("/debug/auth", (req, res) => {
      res.json(this.authenticatedUserStore.dump());
    });

    this.app.get("/debug/users", (req, res) => {
      res.json(this.userStore.getAll());
    });
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
