const uuid = require("uuid");
module.exports = {
  logLevel: process.env.LOG_LEVEL || "error",
  host: process.env.HOST || "0.0.0.0",
  port: process.env.PORT || 5000,
  scope: process.env.SCOPE || "read write",
  username: process.env.USERNAME || "mark",
  user: {
    email: process.env.SSO_EMAIL || "email@example.com",
    contact_email: process.env.SSO_CONTACT_EMAIL || "contact_email@example.com",
    email_user_id: process.env.SSO_EMAIL_USER_ID || "email-123455@id.example.com",
    user_id: process.env.SSO_USER_ID || uuid.v4(),
    first_name: process.env.SSO_USER_FIRST_NAME || "First",
    last_name: process.env.SSO_USER_LAST_NAME || "Last",
    related_emails: [],
    groups: [],
    permitted_applications: [],
    access_profiles: [],
  },
};
