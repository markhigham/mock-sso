import { ILogger, LogManager } from "../logger";
import { IAuthenticatedUserStore } from "./interfaces";

export class InMemoryAuthenticatedUserStore implements IAuthenticatedUserStore {
  private logger: ILogger;
  private store = {};

  constructor() {
    this.logger = LogManager.getLogger(__filename);
  }

  set(key: string, user: any): void {
    this.logger.debug(`set ${user.email} for ${key}`);
    this.store[key] = user;
  }

  get(key: string): any {
    return this.store[key];
  }
}
