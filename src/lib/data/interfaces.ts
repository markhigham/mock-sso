import * as uuid from "uuid";

export interface IAuthenticatedUserStore {
  get(key: string);

  set(key: string, user: any);

  dump(): any;
}

export interface IUserStore {
  load(users: ISSOUser[]);

  getAll(): ISSOUser[];

  find(emailUserId: string): any;

  remove(emailUserId: string): ISSOUser;

  add(user: ISSOUser): void;
}

export interface ISSOUser {
  email: string;
  contact_email: string;
  email_user_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  related_emails?: [],
  groups?: [],
  permitted_applications?: [],
  access_profiles?: [],
}