import { ISSOUser } from "./interfaces";
import { ILogger, LogManager } from "../logger";

export interface IUserList {
  clear(): void;

  getAll(): ISSOUser[];
  clone(): ISSOUser[];

  upsert(user: ISSOUser): ISSOUser;

  remove(emailUserId: string): ISSOUser[];

  find(emailUserId: string): ISSOUser;
}

export class InMemoryUserList implements IUserList {
  private users: ISSOUser[] = [];
  private readonly logger: ILogger;

  constructor(initialUsers: ISSOUser[]) {
    this.logger = LogManager.getLogger(__filename);
    this.users = initialUsers;
    this.logger.debug(`there are ${initialUsers.length} users`);
  }

  clear(): void {
    this.users = [];
  }

  find(emailUserId: string): ISSOUser {
    this.logger.debug(`looking for ${emailUserId}`);
    return this.users.find((u) => {
      return u.email_user_id == emailUserId;
    });
  }

  clone(): ISSOUser[] {
    const result = [];
    result.push(...this.users);
    return result;
  }

  getAll(): ISSOUser[] {
    return this.users.sort((a, b) => a.email.localeCompare(b.email));
  }

  remove(emailUserId: string): ISSOUser[] {
    this.logger.debug(`remove ${emailUserId}`);
    this.logger.debug(this.users);
    const index = this.users.findIndex((u) => u.email_user_id == emailUserId);

    let user: ISSOUser = null;
    if (index > -1) {
      user = this.users[index];
      this.logger.debug(`removing at index ${index}`);
      this.users.splice(index, 1);
    }

    // this.logger.debug(user);

    return this.getAll();
  }

  upsert(user: ISSOUser): ISSOUser {
    this.logger.debug(`upsert ${user.email}`);
    const existing = this.find(user.email_user_id);
    if (existing) return existing;

    this.logger.debug("does not already exist");
    this.users.push(user);

    return user;
  }
}
