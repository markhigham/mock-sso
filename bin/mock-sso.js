#!/usr/bin/env node

const argv = require("minimist")(process.argv.slice(2), {
  alias: { h: "host" },
  string: ["host", "b"],
});

const colors = require("colors");
const logger = require("../lib/logger")(__filename);
const App = require("../lib/app");
let config = require("../config");
const fs = require("fs");
const path = require("path");

if (argv._.length) {
  const filename = argv._[0];

  const fullPath = path.resolve(filename);

  if (!fs.existsSync(fullPath)) {
    const msg = `${fullPath} could not be opened`;
    console.error(msg.red);
    process.exit(-1);
  }
  const file = fs.readFileSync(fullPath, "utf8");
  const json = JSON.parse(file);

  config = Object.assign(config, json);
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

const appName = path.basename(__filename).split(".")[0];

function showHelp() {
  const pkg = require("../package.json");
  const version = pkg.version;
  
  console.log(`${appName} [options] [saved_config_file]
version: ${version}

-p  (Optional) Port number - defaults to 5000

-h  (Optional) Host address - defaults to 0.0.0.0

-e  (Optional) SSO email address. Defaults to value from config

-c  (Optional) SSO contact email address

-b  (Optional) Sets user email and user contact_email to the provided value

-i (Optional) GUID for the SSO user. Will default to a new GUID if missing.

-d (Optional) Dump config based on switches and any config files and exit

saved_config_file (Optional) a json file containing the relevant settings

    `);
}

if (argv.help) {
  showHelp();
  process.exit(0);
}

if (isNaN(config.port)) {
  console.error(`PORT must be numeric ${config.port}`.red);
  showHelp();
  process.exit(-1);
}

process.on("uncaughtException", (err) => {
  console.error("Something unexpected happened. See the error code below".red);
  console.error(err);
  process.exit(-1);
});

if (argv.d) {
  console.log(JSON.stringify(config, null, 2));
  process.exit(0);
}

const app = new App(config);

app
  .start()
  .then(() => {
    console.log(`${appName} listening on ${config.host}:${config.port}`);
    logger.debug(`logging level is ${config.logLevel}`.gray);
  })
  .catch((err) => {
    console.error("Something failed", err);
    process.exit(-1);
  });

function stopApp() {
  // Force shutdown after 5 seconds
  const timeout = setTimeout(() => {
    console.error("Force exit");
    process.exit(-2);
  }, 5000);

  app
    .stop((err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      clearTimeout(timeout);
      logger.debug("exiting");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(-1);
    });
}

// Leave this commented out - let node handle closing connectons
// process.on("SIGINT", stopApp);
// process.on("SIGTERM", stopApp);
