import { IUserService } from "../data/user-service";
import { ILogger, LogManager } from "../logger";

export class DebugRoutes {
  private logger: ILogger;

  constructor(private userService: IUserService) {
    this.logger = LogManager.getLogger(__filename);
    this.logger.debug("Here");
  }

  dump(req, res) {
    const all = this.userService.dumpAll();

    res.send(all);
  }
}
