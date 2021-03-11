#!/usr/bin/env node

import { UserService } from "../lib/data/user-service";

const argv = require("minimist")(process.argv.slice(2), {
  alias: { h: "host" },
  string: ["host", "b"],
});

import { LogManager } from "../lib/logger";
import { getConfig } from "../config";
import { InMemoryAuthenticatedUserStore } from "../lib/data/in-memory-auth-user-store";

import { App } from "../lib/app";
import * as fs from "fs";
import * as path from "path";
import { InMemoryUserList } from "../lib/data/user-list";

const logger = LogManager.getLogger(__filename);

let config = getConfig();

const initialUsers = [];

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

  if (!Array.isArray(users)) {
    throw "Expected users to be an array";
  }

  users.forEach((u) => {
    initialUsers.push(u);
  });
}

config.port = argv.p || config.port;
config.host = argv.h || config.host;

const appName = path.basename(__filename).split(".")[0];

function showHelp() {
  const pkg = require("../package.json");
  const version = pkg.version;

  console.log(`${appName} [options] [saved_config_file]
version: ${version}

-p  (Optional) Port number - defaults to 5000

-h  (Optional) Host address - defaults to 0.0.0.0

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

const authenticatedUserStore = new InMemoryAuthenticatedUserStore();

const commonUserList = new InMemoryUserList(initialUsers);
const service = new UserService(commonUserList);

const app = new App(service, authenticatedUserStore, config);

app
  .start()
  .then(() => {
    const url = `${config.host}:${config.port}`;
    console.log(`${appName} ${config.version} listening on ${url}`);
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
