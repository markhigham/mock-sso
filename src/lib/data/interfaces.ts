/**
 * Stores authentication details for
 * users against their key
 */
export interface IAuthenticatedUserStore {
  get(key: string);
  set(key: string, user: any);
}

export interface ISSOUser {
  email: string;
  contact_email: string;
  email_user_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  related_emails: string[];
  groups?: [];
  permitted_applications?: [];
  access_profiles?: [];
}
