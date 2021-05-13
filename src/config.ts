import * as uuid from "uuid";

const packageConfig = require("../package.json");

export interface IConfig {
  appName: string;
  port: number;
  host: string;
  version?: string;
  repoUrl?: string;
  secret: string;
  scope: string;
  logLevel: string;
}

function getNameFromVcap(defaultName: string): string {
  if (!process.env.VCAP_APPLICATION) return defaultName;

  try {
    const vcap = JSON.parse(process.env.VCAP_APPLICATION);
    const name = vcap.name;

    return name || defaultName;

  } catch (ex) {
    return defaultName;
  }
}

const weakId = "_" + new Date().getTime();
export function getConfig(): IConfig {
  let numericPort: number = 3000;
  if (process.env.PORT) numericPort = Number(process.env.PORT);

  const name = getNameFromVcap("smock-sso");

  return {
    logLevel: process.env.LOG_LEVEL || "debug",
    host: "0.0.0.0",
    port: numericPort,
    version: packageConfig.version,
    repoUrl: packageConfig.repository.url,
    scope: process.env.SCOPE || "read write",
    secret: process.env.COOKIE_SECRET || "this_isnt_intended_for_production_use",
    appName: name,
  };
}
