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
  let numericPort: number = 3000;
  if (process.env.PORT) numericPort = Number(process.env.PORT);

  return {
    logLevel: process.env.LOG_LEVEL || "debug",
    host: "0.0.0.0",
    port: numericPort,
    version: packageConfig.version,
    repoUrl: packageConfig.repository.url,
    scope: process.env.SCOPE || "read write",
    username: process.env.USERNAME || "mark",
    secret: process.env.COOKIE_SECRET || "this_isnt_intended_for_production_use",
    users: [],
  };
}
