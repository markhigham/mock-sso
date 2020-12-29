const uuid = require("uuid");
const weakId = "_" + new Date().getTime();
module.exports = {
  logLevel: process.env.LOG_LEVEL || "error",
  host: process.env.HOST || "0.0.0.0",
  port: process.env.PORT || 5000,
  scope: process.env.SCOPE || "read write",
  username: process.env.USERNAME || "mark",
  multiple: false,
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
