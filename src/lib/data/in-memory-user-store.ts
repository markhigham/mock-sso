import { IUserStore } from "./interfaces";
import { ILogger, LogManager } from "../logger";

export class InMemoryUserStore implements IUserStore {
  private users: any[];
  private logger: ILogger;

  constructor() {
    this.logger = LogManager.getLogger(__filename);
  }

  load(users: any[]) {
    this.logger.debug(`loading users ${users.length}`);
    this.users = users;
  }

  getAll(): any[] {
    return this.users;
  }

  find(emailUserId: string): any {
    this.logger.debug(`looking for ${emailUserId}`);
    return this.users.find((u) => {
      return u.email_user_id == emailUserId;
    });
  }
}
