import fs from "fs";
import crypto from "crypto";

// RS256 keypair for the embedded-wallet custom-auth handshake (Coinbase CDP).
// The private key signs short-lived wallet-auth JWTs (see GetPrivyToken in
// Controllers/User.js); the public half is published at /.well-known/jwks.json
// so the wallet provider can verify them. Keep the kid stable — the provider
// caches JWKS by kid.

export const WALLET_AUTH_KID = "hypertek-wallet-auth-1";
export const WALLET_AUTH_ISSUER = process.env.WALLET_AUTH_ISSUER || "https://api.hypertek100.com";

let privateKeyPem = null;
export const getWalletAuthPrivateKey = () => {
  if (privateKeyPem) return privateKeyPem;
  if (process.env.PRIVY_JWT_PRIVATE_KEY_BASE64) {
    privateKeyPem = Buffer.from(process.env.PRIVY_JWT_PRIVATE_KEY_BASE64, "base64").toString("utf8");
  } else {
    privateKeyPem = fs.readFileSync(new URL("../Config/privy-jwt-private.pem", import.meta.url), "utf8");
  }
  return privateKeyPem;
};

let jwksCache = null;
export const getWalletAuthJwks = () => {
  if (jwksCache) return jwksCache;
  const publicKey = crypto.createPublicKey(getWalletAuthPrivateKey());
  const jwk = publicKey.export({ format: "jwk" });
  jwksCache = {
    keys: [{ ...jwk, kid: WALLET_AUTH_KID, alg: "RS256", use: "sig" }],
  };
  return jwksCache;
};
