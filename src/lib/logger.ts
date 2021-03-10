import * as winston from "winston";

export interface ILogger {
  debug(...any): void;
  error(...any): void;
  info(...any): void;
  warn(...any): void;
  verbose(...any): void;
}

export class LogManager {
  static namespace: string = "ruler";
  static logger: winston.Logger;

  static setNamespace(value: string): void {
    this.namespace = value;
  }

  static getNullLogger(): ILogger {
    function nullLog() {}
    return {
      debug: nullLog,
      error: nullLog,
      info: nullLog,
      warn: nullLog,
      verbose: nullLog,
    };
  }

  static getLogger(name: string): ILogger {
    if (typeof this.logger === "undefined") {
      const consoleFormat = winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.metadata(),
        winston.format.printf((loginfo) => {
          return `${loginfo.level} ${loginfo.metadata.timestamp} ${loginfo.metadata.service} ${loginfo.message}`;
        })
      );

      const logger = winston.createLogger({
        format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.simple()),
        level: "debug",
        transports: [new winston.transports.Console()],
      });

      this.logger = logger;
    }

    const fullName = `${this.namespace}:${name}`;
    return this.logger.child({ service: fullName });
  }
}
