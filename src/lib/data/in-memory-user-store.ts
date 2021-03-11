import { ISSOUser, IUserStore } from "./interfaces";
import { ILogger, LogManager } from "../logger";

export class InMemoryUserStore implements IUserStore {
  private u: { "key:string"?: ISSOUser[] };
  private logger: ILogger;

  constructor(private initialUsers: ISSOUser[]) {
    this.logger = LogManager.getLogger(__filename);
    this.logger.debug(`create with ${initialUsers.length} users`);
    this.u = {};
  }

  load(users: ISSOUser[]) {
    this.logger.debug(`loading users ${users.length}`);
    this.initialUsers = users;
  }

  getAll(userKey: string): ISSOUser[] {
    // return this.initialUsers;
    const specificUsers = this.u[userKey];
    if (specificUsers) return specificUsers;

    this.logger.debug(`no users found for ${userKey}`);
    // lot to unpack...
    // create a new property for this user
    // and set the value to a new array
    // and push the initial users to this array
    const specific = [];
    specific.push(...this.initialUsers);
    this.logger.debug(specific);

    this.u[userKey] = specific;
    this.logger.debug(this.u);

    return specific;
  }

  add(user: ISSOUser): void {
    this.logger.debug(`adding ${user.email} to store`);
    this.initialUsers.push(user);
  }

  find(userKey: string, emailUserId: string): ISSOUser {
    this.logger.debug(`looking for ${emailUserId}`);
    const users = this.getAll(userKey);
    return users.find((u) => {
      return u.email_user_id == emailUserId;
    });
  }

  remove(userKey: string, emailUserId: string): ISSOUser {
    this.logger.debug(`remove ${emailUserId}`);
    const users = this.getAll(userKey);
    const index = users.findIndex((u) => u.email_user_id == emailUserId);
    let user: ISSOUser = null;
    if (index > -1) {
      user = users[index];
      users.splice(index, 1);
    }

    return user;
  }

  count(userKey: string): number {
    return this.getAll(userKey).length;
  }
}
