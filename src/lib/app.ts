import * as path from "path";
import * as multer from "multer";
import * as express from "express";
import * as cookieParser from "cookie-parser";
import * as nunjucks from "nunjucks";
import * as stoppable from "stoppable";

import { ILogger, LogManager } from "./logger";
import { AuthorizeUserRoutes } from "./routes/authorize";
import { IAuthenticatedUserStore } from "./data/interfaces";
import { IConfig } from "../config";
import { TokenRoutes } from "./routes/token";
import { UserRoutes } from "./routes/user";
import { IUserService } from "./data/user-service";
import { DebugRoutes } from "./routes/debug";

export class App {
  private readonly logger: ILogger;
  private readonly app: any;
  private server: any;
  private upload: multer.Multer;

  constructor(private userService: IUserService, private authenticatedUserStore: IAuthenticatedUserStore, private config: IConfig) {
    this.logger = LogManager.getLogger(__filename);

    this.app = express();
    const storage = multer.memoryStorage();
    this.upload = multer({ storage: storage });
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(cookieParser(config.secret));

    this.app.engine("njk", nunjucks.render);
    this.app.set("view engine", "njk");

    nunjucks.configure("views", {
      autoescape: false,
      express: this.app,
    });

    const staticDir = path.join(__dirname + "/../../public");
    this.logger.debug(`staticDir is ${staticDir}`);
    this.app.use(express.static(staticDir));

    this.app.use((req, res, next) => {
      res.locals.version = this.config.version;
      res.locals.repo = this.config.repoUrl;
      res.locals.title = config.appName;
      res.locals.storage =  `${authenticatedUserStore.constructor.name} / ${userService.constructor.name}`;
      next();
    });

    this.setupRoutes();
  }

  private setupRoutes() {
    this.logger.debug("setup routes");
    const authRoutes = new AuthorizeUserRoutes(this.userService, this.authenticatedUserStore, this.config);
    this.app.get("/o/authorize", authRoutes.get.bind(authRoutes));
    this.app.post("/select-user", authRoutes.post.bind(authRoutes));
    this.app.post("/create-user", authRoutes.create.bind(authRoutes));

    this.app.get("/download", authRoutes.downloadUsers.bind(authRoutes));
    this.app.post("/upload", this.upload.single("users"), authRoutes.uploadUsers.bind(authRoutes));

    const tokenRoutes = new TokenRoutes();
    this.app.post("/o/token", tokenRoutes.post.bind(tokenRoutes));

    const userRoutes = new UserRoutes(this.authenticatedUserStore, this.config);
    this.app.get("/api/v1/user/me", userRoutes.user.bind(userRoutes));
    this.app.post("/o/introspect/", userRoutes.introspect.bind(userRoutes));

    const debugRoutes = new DebugRoutes(this.userService);
    this.app.get("/debug/dump", debugRoutes.dump.bind(debugRoutes));

    this.app.get("/", (req, res) => {
      res.render("index", {
        title: `mock-sso`,
      });
    });
  }

  start(): Promise<any> {
    const logger = this.logger;
    return new Promise((resolve, reject) => {
      const httpServer = this.app.listen(this.config.port, this.config.host, (err) => {
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
