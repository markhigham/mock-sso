import * as url from "url";
import * as uuid from "uuid";
import { ILogger, LogManager } from "../logger";
import { IAuthenticatedUserStore, IUserStore } from "../data/interfaces";
import { getUserCode } from "./utils";
import { IConfig } from "../../config";

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

  constructor(private userStore: IUserStore, private authStore: IAuthenticatedUserStore, private config : IConfig) {
    this.logger = LogManager.getLogger(__filename);
  }

  post(req, res) {
    this.logger.debug(req.body);

    const emailUserId = req.body.email_user_id;
    const redirectUri = req.body.redirectUri;
    const userCode = getUserCode(req, res);

    const user = this.userStore.find(emailUserId);

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
    const sortedUsers = this.userStore.getAll().sort((a, b) => {
      return a.email.localeCompare(b.email);
    });

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
