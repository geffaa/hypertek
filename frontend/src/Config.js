// In .env.local for development:  VITE_BACKEND_URL=http://localhost:4700
// In .env.staging:                VITE_BACKEND_URL=https://api.hypertek100.com
// In .env.production:             VITE_BACKEND_URL=https://api.hypertek100.com

import axios from "axios";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4700";

// Pre-launch lock: while true, the marketplace's transactional tabs and the
// user dashboard show a lock overlay and all buy/list/bid actions are
// disabled. Sign-up and wallet creation stay open. Flip to false at the
// official launch.
const LAUNCH_LOCKED = true;

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

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    || "pk_test_51SHewG3UIHQiuHTy62JP9SiQzYm4kVI8uDg158N2RxzmQMUKU0tr5zSVlrSwOCaGmIxFTwEJL59vKJ9cVDzWdUxH005IuFlux3";

const User_Dashboard_Url = `${BACKEND_BASE_URL}/api/v1`;
const MarketPlace_Url = `${BACKEND_BASE_URL}/api/v1`;
const NewsImage_Url = BACKEND_BASE_URL;

// Handles both Cloudinary full URLs and local /uploads/ paths
function getImageUrl(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${BACKEND_BASE_URL}${imagePath}`;
}

export { BACKEND_BASE_URL, LAUNCH_LOCKED, CDP_PROJECT_ID, CDP_WALLET_ENABLED, STRIPE_PUBLISHABLE_KEY, User_Dashboard_Url, NewsImage_Url, MarketPlace_Url, getImageUrl };
