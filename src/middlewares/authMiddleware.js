import jwt from "jsonwebtoken";
import "dotenv/config";

export const generate_jwt = async (payload) => {
  const jwt_secret = process.env.JWT_SECRET;
  const token = jwt.sign(payload, jwt_secret);
  return token;
};

export const auth_middleware = async (req, res, next) => {
  try {
    const cookies = req.headers.cookie;
    if (!cookies) return res.sendStatus(401);
    // check for auth token

    // const auth_token = req.headers["authorization"]?.split(" ")[1];

    // console.log("auth header: ", req.headers);

    const auth_token = cookies
      .split("; ")
      .find((cookie) => cookie.startsWith("token="))
      ?.split("=")[1];

    if (!auth_token) return res.sendStatus(401);

    // verify jwt token, decrypt the token and get user_id
    const jwt_secret = process.env.JWT_SECRET;
    const user_id = jwt.verify(auth_token, jwt_secret);
    console.log("user_id: ", user_id);
    req.user_id = user_id["user_id"];

    next();
  } catch (error) {
    console.log("authentication error:", error.message);
    return res.sendStatus(401);
  }
};

// bearer xfahekljlw32iu8349u9
// ['bearer', 'xfaheklj']
