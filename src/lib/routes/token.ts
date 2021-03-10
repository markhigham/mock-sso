import { ILogger, LogManager } from "../logger";
import { IAuthenticatedUserStore } from "../data/interfaces";

export class TokenRoutes {
  private logger: ILogger;
  constructor() {
    this.logger = LogManager.getLogger(__filename);
  }

  post(req, res) {
    this.logger.info(`${req.method} ${req.originalUrl}`);
    this.logger.debug(req.body);
    res.status(200).send({
      access_token: req.body.code,
      token_type: "Bearer",
    });
  }
}
