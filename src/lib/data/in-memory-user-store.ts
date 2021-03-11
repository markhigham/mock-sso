import { ISSOUser, IUserStore } from "./interfaces";
import { ILogger, LogManager } from "../logger";

export class InMemoryUserStore implements IUserStore {
  private users: ISSOUser[];
  private logger: ILogger;

  constructor() {
    this.logger = LogManager.getLogger(__filename);
  }

  load(users: ISSOUser[]) {
    this.logger.debug(`loading users ${users.length}`);
    this.users = users;
  }

  getAll(): ISSOUser[] {
    return this.users;
  }

  add(user: ISSOUser): void {
    this.logger.debug(`adding ${user.email} to store`);
    this.users.push(user);
  }

  find(emailUserId: string): ISSOUser {
    this.logger.debug(`looking for ${emailUserId}`);
    return this.users.find((u) => {
      return u.email_user_id == emailUserId;
    });
  }

  remove(emailUserId: string): ISSOUser {
    const index = this.users.findIndex(u => u.email_user_id == emailUserId);
    let user: ISSOUser = null;
    if (index > -1) {
      user = this.users[index];
      this.users.splice(index, 1);

    }

    return user;
  }

}
