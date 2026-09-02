// In .env.local for development:  VITE_BACKEND_URL=http://localhost:4700
// In .env.staging:                VITE_BACKEND_URL=https://api.hypertek100.com
// In .env.production:             VITE_BACKEND_URL=https://api.hypertek100.com

import axios from "axios";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4700";

// Pre-launch lock: while true, the marketplace's transactional tabs and the
// user dashboard show a full lock overlay. Turned off so the site can run
// live for demos and marketing, browsing/listing/bidding all work normally.
// Purchases stay blocked separately (see PURCHASES_LOCKED below), enforced
// server-side regardless of this flag.
const LAUNCH_LOCKED = false;

// Purchases specifically (buy now, card payment). The backend rejects these
// independently of this flag, this only controls the button/UI state so it
// shows a small note instead of letting the click round-trip to the server.
const PURCHASES_LOCKED = true;

// Card top-ups for HyperBucks. Hidden while the payment provider and the
// company's tax position are being settled. The backend route and the checkout
// form are both intact, so setting this to true brings the option straight back.
// Users can still fund with a card through the USDC route, where Transak sells
// them USDC into their own wallet.
const CARD_TOPUP_ENABLED = false;

// Coinbase CDP embedded wallets (non-custodial player wallets). The whole
// integration is inert until VITE_CDP_PROJECT_ID is set in the build env,
// so production keeps the legacy custodial flow until the cutover.
const CDP_PROJECT_ID = import.meta.env.VITE_CDP_PROJECT_ID || "";
const CDP_WALLET_ENABLED = CDP_PROJECT_ID.length > 0;

// Global axios interceptor — logs full error response in dev
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (import.meta.env.DEV) {
      const status = err.response?.status;
      const url = err.config?.url;
      const data = err.response?.data;
      console.error(`[API Error] ${err.config?.method?.toUpperCase()} ${url} → ${status}`, data);
    }
    return Promise.reject(err);
  }
);

// Publishable (not secret) by design, but still env-driven only — set
// VITE_STRIPE_PUBLISHABLE_KEY in .env.local / deploy.yml.
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

const User_Dashboard_Url = `${BACKEND_BASE_URL}/api/v1`;
const MarketPlace_Url = `${BACKEND_BASE_URL}/api/v1`;
const NewsImage_Url = BACKEND_BASE_URL;

// Marketing/gameplay videos, proxied through our own backend instead of the
// shared pub-*.r2.dev bucket subdomain. Some ISPs intercept that shared dev
// domain with their own content-filtering TLS certificate, breaking playback;
// our own domain's certificate isn't affected. See backend/Index.js's
// /media/:filename route.
const VIDEO_BASE_URL = `${BACKEND_BASE_URL}/media`;

// Handles both Cloudinary full URLs and local /uploads/ paths
function getImageUrl(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${BACKEND_BASE_URL}${imagePath}`;
}

export { BACKEND_BASE_URL, LAUNCH_LOCKED, PURCHASES_LOCKED, CARD_TOPUP_ENABLED, CDP_PROJECT_ID, CDP_WALLET_ENABLED, STRIPE_PUBLISHABLE_KEY, User_Dashboard_Url, NewsImage_Url, MarketPlace_Url, VIDEO_BASE_URL, getImageUrl };
