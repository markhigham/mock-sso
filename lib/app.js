const url = require("url");
const path = require("path");

const logger = require("./logger")(__filename);
const express = require("express");
const bodyParser = require("body-parser");

function App(config) {
  if (typeof config === "undefined") throw Error("config is required");

  function authorize(req, res) {
    logger.info(req.originalUrl);
    const state = req.query["state"];
    const originalRedirectUri = req.query["redirect_uri"];

    const parsedUrl = url.parse(originalRedirectUri);
    const redirectTo = url.format({
      protocol: parsedUrl.protocol,
      host: parsedUrl.host,
      query: {
        code: "abcdef",
        state: state,
        redirect_uri: originalRedirectUri,
      },
      pathname: parsedUrl.pathname,
    });

    logger.debug(redirectTo);

    res.redirect(redirectTo);
  }

  function token(req, res) {
    logger.info(`${req.method} ${req.originalUrl}`);
    res.status(200).send({
      access_token: req.body.code,
      token_type: "Bearer",
    });
  }

  function user(req, res) {
    logger.info(`${req.method} ${req.originalUrl}`);
    const response = config.user;
    res.status(200).send(response);
  }

  function introspect(req, res) {
    logger.info(`${req.method} ${req.originalUrl}`);
    const response = {
      scope: config.scope,
      active: true,
      exp: 2524608000,
      username: config.username,
    };

    return res.status(200).send(response);
  }

  const app = express();
  let server;
  logger.debug(config);

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname + "/../public")));

  app.get("/o/authorize", authorize);
  app.post("/o/token", token);
  app.get("/api/v1/user/me", user);
  app.post("/o/introspect/", introspect);

  app.get("/config", (req, res) => {
    res.json(config);
  });

  app.post("/config", (req, res) => {
    config.user = req.body;
    res.json(config);
  });

  app.all("*", (req, res) => {
    logger.error(`404 ${req.method} ${req.originalUrl}`);
    res.json({});
  });

  function start() {
    return new Promise((resolve, reject) => {
      server = app.listen(config.port, (err) => {
        if (err) {
          logger.error(err);
          reject(err);
          return;
        }
        logger.info(`started on ${config.host}:${config.port}`);
        resolve();
      });
    });
  }

  function stop() {
    if (!server.listening) {
      logger.debug("server not listening!");
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // https://stackoverflow.com/a/36830072/155965
      server.close((err) => {
        if (err) {
          reject(err);
          return;
        }

        logger.debug("server.close ok");
        resolve();
      });
      setImmediate(function () {
        logger.debug("emitting close to connectons");
        server.emit("close");
      });
    });
  }

  return {
    start: start,
    stop: stop,
  };
}

module.exports = App;
