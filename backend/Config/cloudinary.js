import { v2 as cloudinary } from "cloudinary";

let configured = false;

/**
 * Lazily configure Cloudinary the first time it's needed.
 * This avoids the ES-module-import-before-dotenv race condition.
 */
function ensureConfigured() {
  if (configured) return;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }
  configured = true;
}

function getCloudinary() {
  ensureConfigured();
  return cloudinary;
}

function getIsCloudinaryEnabled() {
  ensureConfigured();
  if (process.env.DISABLE_CLOUDINARY === "true") return false;
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export { getCloudinary as cloudinary, getIsCloudinaryEnabled as isCloudinaryEnabled };
// Keep backward compat for other files that import cloudinary directly
export default cloudinary;
