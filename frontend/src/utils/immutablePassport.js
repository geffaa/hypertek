import { config, passport } from '@imtbl/sdk';

// TODO: Replace these with your actual Immutable Client ID and Redirect URIs
// You can get these from the Immutable Developer Hub: https://hub.immutable.com/
const CLIENT_ID = 'ltm2jrSlPoODLBTHM4nfHQfM3qjF1kod';
const REDIRECT_URI = 'https://hyper-tek-games.deventiatech.com/login/callback';
const LOGOUT_REDIRECT_URI = 'https://hyper-tek-games.deventiatech.com/logout/callback'; // Optional, but recommended

const baseConfig = new config.ImmutableConfiguration({
  environment: config.Environment.SANDBOX, // Change to PRODUCTION when ready
});

const passportInstance = new passport.Passport({
  baseConfig,
  clientId: CLIENT_ID,
  redirectUri: REDIRECT_URI,
  logoutRedirectUri: LOGOUT_REDIRECT_URI,
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
});

console.log("immutablePassport.js loaded");
// alert("Immutable Passport Config Loading...");

export { passportInstance };
