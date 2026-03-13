// In .env.local for development:  VITE_BACKEND_URL=http://localhost:4700
// In .env.staging:                VITE_BACKEND_URL=https://api.hypertek100.com
// In .env.production:             VITE_BACKEND_URL=https://api.hypertek100.com

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4700";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    || "pk_test_51SHewG3UIHQiuHTy62JP9SiQzYm4kVI8uDg158N2RxzmQMUKU0tr5zSVlrSwOCaGmIxFTwEJL59vKJ9cVDzWdUxH005IuFlux3";

const User_Dashboard_Url = `${BACKEND_BASE_URL}/api/v1`;
const MarketPlace_Url = `${BACKEND_BASE_URL}/api/v1`;
const NewsImage_Url = BACKEND_BASE_URL;

// Handles both Cloudinary full URLs and local /uploads/ paths
function getImageUrl(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  // Legacy: /uploads/temp/ paths saved before Cloudinary migration
  return `${BACKEND_BASE_URL}${imagePath.replace("/uploads/temp/", "/uploads/news/")}`;
}

export { BACKEND_BASE_URL, STRIPE_PUBLISHABLE_KEY, User_Dashboard_Url, NewsImage_Url, MarketPlace_Url, getImageUrl };
