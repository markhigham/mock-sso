export interface IAuthenticatedUserStore {
  get(key: string);

  set(key: string, user: any);
}

export interface IUserStore {
  load(users: any[]);

  getAll(): any[];

  find(emailUserId: string): any;
}
