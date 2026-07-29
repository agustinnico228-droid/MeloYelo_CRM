/**
 * One-off test helper: mint a valid Auth.js session cookie for the
 * given email so SSO and authed pages can be verified without a
 * browser Google flow. Uses the same AUTH_SECRET + salt derivation as
 * the running server. NEVER ship or commit real tokens.
 */
import { encode } from "next-auth/jwt";

const email = process.env.MINT_EMAIL ?? "gab@meloyelo.nz";
const secret = process.env.AUTH_SECRET;
if (!secret) {
  console.error("AUTH_SECRET missing");
  process.exit(1);
}

const token = await encode({
  token: { email, name: email.split("@")[0], sub: email },
  secret,
  salt: "authjs.session-token",
  maxAge: 60 * 60,
});
console.log(token);
