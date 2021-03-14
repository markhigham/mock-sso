import { ISSOUser } from "./interfaces";
import { ILogger, LogManager } from "../logger";
import { InMemoryUserList, IUserList } from "./user-list";

// this could be anything as user lists are keyed by guid
const INITIAL_USERS_LIST = "__shared";

export interface IUserService {
  getAvailableUsers(userKey: string): ISSOUser[];
  dumpUsers(userKey: string): ISSOUser[];
  add(userKey: string, user: ISSOUser): ISSOUser;
  remove(code: string, emailUserId: string): ISSOUser[];
  find(userCode: string, emailUserId: string): ISSOUser;

  uploadUsers(userCode: string, users: ISSOUser[]): ISSOUser[];
}

export class UserService implements IUserService {
  private logger: ILogger;

  private allUsers: { "key:string"?: IUserList } = {};

  constructor(private initialUserList: IUserList) {
    this.logger = LogManager.getLogger(__filename);
    this.logger.debug(`created`);
    this.allUsers[INITIAL_USERS_LIST] = initialUserList;
  }

  dumpUsers(userKey: string): ISSOUser[] {
    this.logger.debug(`dumpUsers for ${userKey}`);
    return this.getUserList(userKey).getAll();
  }

  uploadUsers(userKey: string, users: ISSOUser[]): ISSOUser[] {
    this.logger.debug(`uploadUsers for ${userKey}`);
    const list = new InMemoryUserList(users);
    this.allUsers[userKey] = list;
    return list.getAll();
  }

  getAvailableUsers(userKey: string): ISSOUser[] {
    this.logger.debug(`getAvailableUsers for ${userKey}`);
    return this.getUserList(userKey).getAll();
  }

  private addUser(user: ISSOUser, userList: IUserList): ISSOUser {
    return userList.upsert(user);
  }

  add(userKey: string, user: ISSOUser): ISSOUser {
    return this.getUserList(userKey).upsert(user);
  }

  remove(code: string, emailUserId: string): ISSOUser[] {
    this.logger.debug(`remove ${emailUserId} from ${code}`);
    return this.getUserList(code).remove(emailUserId);
  }

  private getUserList(userCode: string): IUserList {
    const userList = this.allUsers[userCode];
    if (userList) return userList;

    const newList = new InMemoryUserList(this.initialUserList.getAll());
    this.allUsers[userCode] = newList;
    return newList;
  }

  find(userCode: string, emailUserId: string): ISSOUser {
    return this.getUserList(userCode).find(emailUserId);
  }
}
