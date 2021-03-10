#!/usr/bin/env node

const argv = require("minimist")(process.argv.slice(2), {
  alias: { h: "host" },
  string: ["host", "b"],
});

import { LogManager } from "../lib/logger";
import { getConfig } from "../config";
import { LocalUserStore } from "../lib/local-store";

import { App } from "../lib/app";
import * as fs from "fs";
import * as path from "path";

const logger = LogManager.getLogger(__filename);

let config = getConfig();

if (argv._.length) {
  const filename = argv._[0];

  const fullPath = path.resolve(filename);

  if (!fs.existsSync(fullPath)) {
    const msg = `${fullPath} could not be opened`;
    console.error(msg);
    process.exit(-1);
  }
  const file = fs.readFileSync(fullPath, "utf8");
  const users = JSON.parse(file);
  let user;

  if (Array.isArray(users)) {
    user = users[0];
    config.multiple = true;
    config.users = users;
  } else {
    user = users;
  }
  logger.debug(users);
  config.user = Object.assign(config.user, user);
}

config.port = argv.p || config.port;
config.host = argv.h || config.host;

config.user.email = argv.e || config.user.email;
config.user.contact_email = argv.c || config.user.contact_email;

if (argv.b) {
  config.user.email = argv.b;
  config.user.contact_email = argv.b;
}

config.user.user_id = argv.i || config.user.user_id;

// django-staff-sso v3.0.0 requires email_user_id
if (argv.u) {
  config.user.email_user_id = argv.u;
}
// but only use a default if the value in config is missing !
if (!config.user.email_user_id) {
  config.user.email_user_id = `id-${config.user.email}`;
}

const appName = path.basename(__filename).split(".")[0];

function showHelp() {
  const pkg = require("../package.json");
  const version = pkg.version;

  console.log(`${appName} [options] [saved_config_file]
version: ${version}

-p  (Optional) Port number - defaults to 5000

-h  (Optional) Host address - defaults to 0.0.0.0

-u  (Optional) specify a value to be returned for email_user_id. Defaults to -e email 

-e  (Optional) SSO email address. Defaults to value from config

-c  (Optional) SSO contact email address

-b  (Optional) Sets user email and user contact_email to the provided value

-i (Optional) GUID for the SSO user. Will default to a new GUID if missing.

-u (Optional) email address to use as email_user_id. Will default to id+SSO email address if missing.

-d (Optional) Dump config based on switches and any config files and exit

saved_config_file (Optional) a json file containing the relevant settings

    `);
}

if (argv.help) {
  showHelp();
  process.exit(0);
}

if (isNaN(config.port)) {
  console.error(`PORT must be numeric ${config.port}`);
  showHelp();
  process.exit(-1);
}

process.on("uncaughtException", (err) => {
  console.error("Something unexpected happened. See the error code below");
  console.error(err);
  process.exit(-1);
});

if (argv.d) {
  console.log(JSON.stringify(config.user, null, 2));
  process.exit(0);
}

const packageConfig = require("../../package.json");
const store = new LocalUserStore();
const app = new App(store, config, packageConfig.version, packageConfig.repository.url);

app
  .start()
  .then(() => {
    const url = `${config.host}:${config.port}`;
    console.log(`${appName} ${packageConfig.version} listening on ${url}`);
    console.log(`visit http://${url}/config to view current user`);
    console.debug(`logging level is ${config.logLevel}`);
  })
  .catch((err) => {
    console.error("Something failed", err);
    process.exit(-1);
  });

function stopApp() {
  app
    .stop()
    .then((err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      logger.debug("exiting");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(-1);
    });
}

process.on("SIGINT", stopApp);
process.on("SIGTERM", stopApp);
