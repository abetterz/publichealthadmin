const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();
const GOOGLE_AUTH_CLIENT_ID = process.env.GOOGLE_AUTH_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_AUTH_CLIENT_ID);

async function googleAuthVerify({ id_token }) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_AUTH_CLIENT_ID, // Specify the GOOGLE_AUTH_CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();

    const today = Date.now();
    // check if token is expired

    return payload;
  } catch (error) {
    return null;
  }
}

function checkAuthenticated(req, res, next) {
  let token = req.cookies["session-token"];

  let user = {};
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_AUTH_CLIENT_ID, // Specify the GOOGLE_AUTH_CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    user.name = payload.name;
    user.email = payload.email;
    user.picture = payload.picture;
  }
}

module.exports = {
  googleAuthVerify,
  checkAuthenticated,
};
