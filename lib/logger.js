const winston = require("winston");
const path = require("path");
const config = require("../config");

let logger;

function makeLogger() {
  const logger = winston.createLogger({
    level: config.logLevel,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.metadata(),

      winston.format.printf((loginfo) => {
        let json = "Error!";
        try {
          if (typeof loginfo.message === "object") json = JSON.stringify(loginfo.message, null, 2);
          else json = loginfo.message;
        } catch (e) {
          console.error(e);
        }
        return `${loginfo.level} ${json}`;
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

module.exports = function (filename) {
  const name = path.basename(filename);

  if (typeof logger === "undefined") {
    logger = makeLogger();
  }

  return logger.child({ filename: filename, name: name });
};
