import * as winston from "winston";
import * as path from "path";

// import { ConfigurationManager } from "./configuration";

export interface ILogger {
  debug(...any): void;
  error(...any): void;
  info(...any): void;
  warn(...any): void;
  verbose(...any): void;
}

export class LogManager {
  static logger: winston.Logger;

  private static makeLogger(): winston.Logger {
    // const config = ConfigurationManager.getConfig();

    const logger = winston.createLogger({
      level: "debug",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.simple(),
        winston.format.metadata(),
        winston.format.colorize(),

        winston.format.printf((loginfo) => {
          let json = "Error!";
          let stack = "";
          try {
            if (typeof loginfo.message === "object") json = JSON.stringify(loginfo.message);
            else json = loginfo.message;

            if (loginfo.metadata.stack) {
              stack = loginfo.metadata.stack;
            }
          } catch (e) {
            // Oh shit!
            console.error(e);
          }
          return `${loginfo.metadata.name} ${loginfo.level} ${json}${stack}`;
        })
      ),
      transports: [
        new winston.transports.Console({
          stderrLevels: ["error"],
        }),
      ],
    });

    return logger;
  }

  static getLogger(filename: string): ILogger {
    const name = path.basename(filename);
    if (typeof this.logger === "undefined") {
      this.logger = this.makeLogger();
    }
    return this.logger.child({ filename: filename, name: name });
  }

  static getNamedLogger(name: string): ILogger {
    if (typeof this.logger === "undefined") {
      this.logger = this.makeLogger();
    }

    return this.logger.child({ service: name });
  }
}
