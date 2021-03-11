import * as url from "url";
import { ILogger, LogManager } from "../logger";
import { IAuthenticatedUserStore } from "../data/interfaces";
import { getUserCode } from "./utils";
import { IConfig } from "../../config";
import { SSOUser } from "../data/sso-user";
import { IUserService } from "../data/user-service";

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
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const email = req.body.email;

    const user = new SSOUser(email, firstName, lastName);
    this.logger.debug(user);

    const userCode = getUserCode(req, res);
    this.userService.add(userCode, user);
    this.authStore.set(userCode, user);

    res.redirect(redirectUri);
  }

  removeUser(req, res, emailUserId, redirectUri) {
    this.logger.debug("removeUser");
    const code = getUserCode(req, res);
    const user = this.userService.remove(code, emailUserId);
    if (user) {
      res.status(200).send(`${user.email} was removed. You should go back to your app and re-authenticate`);
    } else {
      res.status(400).send(`${emailUserId} was not found`);
    }
  }

  post(req, res) {
    this.logger.debug(req.body);

    const emailUserId = req.body.email_user_id;
    const action = req.body.submit_button;
    const redirectUri = req.body.redirectUri;
    const userCode = getUserCode(req, res);

    if (action == "remove-user") return this.removeUser(req, res, emailUserId, redirectUri);

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
    const code = getUserCode(req, res);
    const redirectTo = makeRedirectUrl(req.query["redirect_uri"], req.query["state"], code);

    let sortedUsers = [];

    const availableUsers = this.userService.getAvailableUsers(code);
    if (availableUsers && availableUsers.length) {
      sortedUsers = availableUsers.sort((a, b) => {
        return a.email.localeCompare(b.email);
      });
    }

    const context = {
      redirectUri: redirectTo,
      users: sortedUsers,
      title: `mock-sso`,
      version: this.config.version,
      repo: this.config.repoUrl,
    };

    res.render("multiple", context);
  }
}
