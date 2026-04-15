// ============ Base URLs — driven by environment ============
// In .env.local for development:  VITE_BACKEND_URL=http://localhost:4700
// In .env.staging:                VITE_BACKEND_URL=https://api.hypertek100.com
// In .env.production:             VITE_BACKEND_URL=https://api.hypertek100.com

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4700";
const FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

const Dashboard_Base_Url = `${BACKEND_BASE_URL}/api`;
const Image_Base_Url = BACKEND_BASE_URL;

// Handles Cloudinary full URLs and local /uploads/ paths
function getImageUrl(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${BACKEND_BASE_URL}${imagePath}`;
}

export { BACKEND_BASE_URL, FRONTEND_BASE_URL, Dashboard_Base_Url, Image_Base_Url, getImageUrl };