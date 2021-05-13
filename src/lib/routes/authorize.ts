import * as url from "url";
import { ILogger, LogManager } from "../logger";
import { IAuthenticatedUserStore, ISSOUser } from "../data/interfaces";
import { getUserCode } from "./utils";
import { IConfig } from "../../config";
import { SSOUser } from "../data/sso-user";
import { IUserService } from "../data/user-service";
import * as moment from "moment";

const logger = LogManager.getLogger(__filename);

function makeRedirectUrl(originalRedirectUri: string, state: string, code: string): string {
  logger.debug(originalRedirectUri);
  const parsedUrl = new url.URL(originalRedirectUri);
  const redirectTo = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}?state=${state}&redirect_uri=${originalRedirectUri}&code=${code}`;
  logger.debug(redirectTo);
  return redirectTo;
}

export class AuthorizeUserRoutes {
  private logger: ILogger;

  constructor(private userService: IUserService, private authStore: IAuthenticatedUserStore, private config: IConfig) {
    this.logger = LogManager.getLogger(__filename);
  }

  create(req, res) {
    this.logger.info(`${req.method} ${req.originalUrl}`);

    const redirectUri = req.body.redirectUri;
    const clientId = req.body.clientId;
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const email = req.body.email;

    const user = new SSOUser(email, firstName, lastName);
    this.logger.debug(user);

    const userCode = getUserCode(req, res, clientId);
    this.userService.add(userCode, user);
    this.authStore.set(userCode, user);

    res.redirect(redirectUri);
  }

  downloadUsers(req, res) {
    this.logger.debug("downloadUsers");
    const clientId = req.query["client_id"];
    const userCode = getUserCode(req, res, clientId);

    this.logger.debug(`clientId: ${clientId}`);
    this.logger.debug(`userCode: ${userCode}`);

    const users = this.userService.dumpUsers(userCode);

    this.logger.debug(users);

    const now = moment.utc();
    const filename = `mock-sso-${now.format("YYYY-MM-DD-HHmm")}.json`;

    this.logger.debug(`filename: ${filename}`)

    res.setHeader("Content-type", "application/json");
    res.setHeader("Content-disposition", `attachment; filename=${filename}`);

    res.json(users);
  }

  uploadUsers(req, res) {
    const redirectUri = req.body.redirectUri;
    if (!req.file) res.status(400).send("expected a file to be uploaded");
    try {
      const clientId = req.body["clientId"];
      logger.debug(clientId);
      const userCode = getUserCode(req, res, clientId);

      const contents = req.file.buffer.toString();
      const users = JSON.parse(contents);

      logger.debug(users);

      if (!Array.isArray(users)) throw "The upload file should contain an array of user objects";

      const uploadedUsers = this.userService.uploadUsers(userCode, users);
      this.renderAuthPage(res, uploadedUsers, redirectUri, clientId);
    } catch (ex) {
      this.logger.error(ex);
      this.renderError(res, ex);
    }
  }

  renderError(res, message: string) {
    this.logger.error(message);
    res.render("error", {
      message: message,
      title: `mock-sso`,
    });
  }

  removeUser(req, res, emailUserId: string, redirectUri: string, clientId: string) {
    this.logger.debug("removeUser");
    const code = getUserCode(req, res, clientId);
    const remainingUsers = this.userService.remove(code, emailUserId);

    this.renderAuthPage(res, remainingUsers, redirectUri, clientId);
  }

  post(req, res) {
    this.logger.debug(req.body);

    const emailUserId = req.body.email_user_id;
    const clientId = req.body.clientId;

    const action = req.body.submit_button;
    const redirectUri = req.body.redirectUri;
    const userCode = getUserCode(req, res, clientId);

    if (action == "remove-user") return this.removeUser(req, res, emailUserId, redirectUri, clientId);

    const user = this.userService.find(userCode, emailUserId);

    if (!user) {
      res.status(500).send(`User ${emailUserId} has gone missing`);
      return;
    }

    this.authStore.set(userCode, user);

    logger.info(`setting user to ${user.email_user_id}`);
    logger.debug(redirectUri);

    res.redirect(redirectUri);
  }

  get(req, res) {
    this.logger.info("authorize for multiple users");

    const clientId = req.query["client_id"];
    const code = getUserCode(req, res, clientId);

    const redirectUri = req.query["redirect_uri"];
    const state = req.query["state"];

    logger.debug(`client_id: ${clientId}`);
    logger.debug(`redirect_uri: ${redirectUri}`);
    logger.debug(`state: ${state}`);

    const redirectTo = makeRedirectUrl(redirectUri, state, code);

    logger.debug(`redirect url: ${redirectTo}`);

    const availableUsers = this.userService.getAvailableUsers(code);
    this.renderAuthPage(res, availableUsers, redirectTo, clientId, state);
  }

  private renderAuthPage(res, users: ISSOUser[], redirectUri: string, oauthClientId?: string, state?: string) {
    const context = {
      redirectUri: redirectUri,
      users: users,

      clientId: oauthClientId,
      state: state,
    };

    res.render("select-user", context);
  }
}
