"use strict";

const url = require("url");
const path = require("path");
const stoppable = require("stoppable");
const logger = require("./logger")(__filename);
const express = require("express");
const bodyParser = require("body-parser");

function App(config) {
  if (typeof config === "undefined") throw Error("config is required");

  function makeRedirectUrl(originalRedirectUri, state) {
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

    return redirectTo;
  }

  function authorize_multiple_users(req, res) {
    logger.info("authorize for multiple users");
    const redirectTo = makeRedirectUrl(req.query["redirect_uri"], req.query["state"]);
    res.render("multiple", {
      redirectUri: redirectTo,
      users: config.users,
    });
  }

  function select_from_multiple_users(req, res) {
    logger.debug(req.body);
    const emailUserId = req.body.email_user_id;
    const redirectUri = req.body.redirectUri;

    const user = config.users.find((u) => {
      logger.debug(u.email_user_id);
      return u.email_user_id == emailUserId;
    });

    if (!user) {
      res.status(500).send(`User ${emailUserId} has gone missing`);
      return;
    }

    config.user = user;
    logger.info(`setting user to ${user.email_user_id}`);

    logger.debug(redirectUri);

    res.redirect(redirectUri);
  }

  function authorize(req, res) {
    logger.info("authorize");
    logger.debug(`authorize ${req.originalUrl}`);
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

    logger.info(`redirecting to ${parsedUrl.host}`);
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
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.url}`);
    next();
  });

  app.set("view engine", "ejs");
  logger.debug("using ejs for views");
  app.set("views", path.join(__dirname + "/../views"));
  app.use(express.static(path.join(__dirname + "/../public")));

  const authorizeUrl = "/o/authorize";
  if (config.multiple) {
    logger.info("authorize for multiple");
    app.get(authorizeUrl, authorize_multiple_users);
  } else {
    logger.info("authorize simple");
    app.get(authorizeUrl, authorize);
  }

  app.post("/select-user", select_from_multiple_users);
  app.post("/o/token", token);
  app.get("/api/v1/user/me", user);
  app.post("/o/introspect/", introspect);

  app.get("/config", (req, res) => {
    res.json(config);
  });

  app.get("/user", (req, res) => {
    res.json(config.user);
  });

  app.post("/user", (req, res) => {
    config.user = req.body;
    res.json(config.user);
  });

  app.patch("/user", (req, res) => {
    user = req.body;
    config.user = Object.assign(config.user, user);
    res.json(config.user);
  });

  app.all("*", (req, res) => {
    logger.error(`404 ${req.method} ${req.originalUrl}`);
    res.json({});
  });

  function start() {
    return new Promise((resolve, reject) => {
      const httpServer = app.listen(config.port, (err) => {
        if (err) {
          logger.error(err);
          reject(err);
          return;
        }
        logger.info(`started on ${config.host}:${config.port}`);
        resolve();
      });

      server = stoppable(httpServer, 0);
    });
  }

  function stop() {
    if (!server.listening) {
      logger.debug("server not listening!");
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // https://stackoverflow.com/a/36830072/155965
      server.stop(function (err) {
        if (err) {
          reject(err);
          return;
        }

        logger.debug("server.close ok");
        resolve();
      });
      // setImmediate(function () {
      //   logger.debug("emitting close to connectons");
      //   server.emit("close");
      // });
    });
  }

  return {
    start: start,
    stop: stop,
  };
}

module.exports = App;
