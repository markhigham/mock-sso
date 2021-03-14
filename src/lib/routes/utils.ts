import * as uuid from "uuid";

/**
 *
 * @param req
 * @param res
 * @param clientId - when this is set it will create login on a per application basis
 */
export function getUserCode(req, res, clientId: string) {
  const cookieName = `mock-sso-cookie${clientId}`;
  if (req.cookies && req.cookies[cookieName]) return req.cookies[cookieName];

  const cookieValue = uuid.v4() + clientId;

  res.cookie(cookieName, cookieValue, { httpOnly: true });
  return cookieValue;
}

//  https://stackoverflow.com/a/57348550
export function extractToken(req) {
  if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
    return req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
}
