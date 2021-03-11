import { ILogger, LogManager } from "../logger";
import { IAuthenticatedUserStore } from "../data/interfaces";
import { extractToken } from "./utils";
import { IConfig } from "../../config";

export class UserRoutes {
  private readonly logger: ILogger;

  constructor(private authStore: IAuthenticatedUserStore, private config: IConfig) {
    this.logger = LogManager.getLogger(__filename);
  }

  user(req, res) {
    this.logger.info(`${req.method} ${req.originalUrl}`);

    const token = extractToken(req);

    if (!token) res.status(400).send({});

    const user = this.authStore.get(token);
    res.status(200).send(user);
  }

  introspect(req, res) {
    const token = extractToken(req);
    if (!token) res.status(400).send({});

    const user = this.authStore.get(token);

    this.logger.info(`${req.method} ${req.originalUrl}`);
    const response = {
      scope: this.config.scope,
      active: true,
      exp: 2524608000,
      username: user.username,
    };

    return res.status(200).send(response);
  }


}
