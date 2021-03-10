import { ILogger, LogManager } from "./logger";

export interface IUserStore {
  add(key: string, user: any);

  get(key: string);
}

export class LocalUserStore implements IUserStore {
  private logger: ILogger;
  private store = {};

  constructor() {
    this.logger = LogManager.getLogger(__filename);
  }

  add(key: string, user: any): void {
    this.store[key] = user;
  }

  get(key: string): any {
    return this.store[key];
  }
}
