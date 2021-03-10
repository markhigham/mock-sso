import * as uuid from "uuid";

const packageConfig = require("../package.json");

export interface IConfig {
  port: number;
  host: string;
  version?: string;
  repoUrl?: string;
  secret: string;
  scope: string;
}

const weakId = "_" + new Date().getTime();
export function getConfig() {
  return {
    logLevel: process.env.LOG_LEVEL || "debug",
    host: "0.0.0.0",
    port: 5000,
    version: packageConfig.version,
    repoUrl: packageConfig.repository.url,
    scope: process.env.SCOPE || "read write",
    username: process.env.USERNAME || "mark",
    secret: process.env.COOKIE_SECRET || "this_isnt_intended_for_production_use",
    users: [],
    user: {
      email: process.env.SSO_EMAIL || "email" + weakId + "@example.com",
      contact_email: process.env.SSO_CONTACT_EMAIL || "contact_email" + weakId + "@example.com",
      email_user_id: process.env.SSO_EMAIL_USER_ID || "email-" + weakId + "@id.example.com",
      user_id: process.env.SSO_USER_ID || uuid.v4(),
      first_name: process.env.SSO_USER_FIRST_NAME || "First",
      last_name: process.env.SSO_USER_LAST_NAME || "Last" + weakId,
      related_emails: [],
      groups: [],
      permitted_applications: [],
      access_profiles: [],
    },
  };
}
