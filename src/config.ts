import * as uuid from "uuid";

const weakId = "_" + new Date().getTime();
export function getConfig() {
  return {
    logLevel: process.env.LOG_LEVEL || "debug",
    host: "0.0.0.0",
    port: 5000,
    scope: process.env.SCOPE || "read write",
    username: process.env.USERNAME || "mark",
    multiple: false,
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