import * as uuid from "uuid";
import { ISSOUser } from "./interfaces";

export class SSOUser implements ISSOUser {
  readonly contact_email: string;
  readonly email: string;
  readonly email_user_id: string;

  readonly first_name: string;
  readonly last_name: string;
  readonly user_id: string;

  readonly related_emails: string[];

  constructor(email: string, firstName: string, lastName: string, emailUserId?: string) {
    const weakId = "_" + new Date().getTime();

    this.email = email;
    this.contact_email = email;
    if (emailUserId) this.email_user_id = emailUserId;
    else this.email_user_id = `${email}${weakId}`;

    this.first_name = firstName;
    this.last_name = lastName;
    this.related_emails = [];

    this.user_id = uuid.v4();
  }
}
