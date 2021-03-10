import * as uuid from "uuid";

export function getUserCode(req, res) {
  const cookieName = "mock-sso-cookie";
  if (req.cookies && req.cookies[cookieName]) return req.cookies[cookieName];

  const cookieValue = uuid.v4();
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
