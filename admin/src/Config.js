// ============ Base URLs — driven by environment ============
// In .env.local for development:  VITE_BACKEND_URL=http://localhost:4700
// In .env.staging:                VITE_BACKEND_URL=https://api.hypertek100.com
// In .env.production:             VITE_BACKEND_URL=https://api.hypertek100.com

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4700";

const Dashboard_Base_Url = `${BACKEND_BASE_URL}/api`;
const Image_Base_Url = BACKEND_BASE_URL;

export { BACKEND_BASE_URL, Dashboard_Base_Url, Image_Base_Url };