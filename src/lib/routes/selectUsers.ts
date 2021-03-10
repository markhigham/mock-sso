import * as url from "url";
import { LogManager } from "../logger";

const logger = LogManager.getLogger(__filename);

function makeRedirectUrl(originalRedirectUri, state) {
  logger.debug(originalRedirectUri);
  const parsedUrl = new url.URL(originalRedirectUri);
  const redirectTo = `${parsedUrl.protocol}`;

  url.format({
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
  return redirectTo;
}

export function authorizeMultipleUsers(req, res) {
  logger.info("authorize for multiple users");

  const redirectTo = makeRedirectUrl(req.query["redirect_uri"], req.query["state"]);
  // const sortedUsers = config.users.sort((a, b) => {
  //   return a.email.localeCompare(b.email);
  // });

  const context = {
    redirectUri: redirectTo,
    users: [],
    title: `mock-sso`,
    version: "versionInfo",
    repo: "repoUrl",
  };

  logger.debug(context);

  res.render("multiple", context);
}
