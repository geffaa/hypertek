export const BACKEND_BASE_URL ="https://api-hyper-tek-games.deventiatech.com";
// export const BACKEND_BASE_URL ="http://localhost:4700";
export const STRIPE_PUBLISHABLE_KEY="pk_test_51SHewG3UIHQiuHTy62JP9SiQzYm4kVI8uDg158N2RxzmQMUKU0tr5zSVlrSwOCaGmIxFTwEJL59vKJ9cVDzWdUxH005IuFlux3"

const User_Dashboard_Url ="https://api-hyper-tek-games.deventiatech.com/api/v1"
const MarketPlace_Url ="https://api-hyper-tek-games.deventiatech.com/api/v1"
const NewsImage_Url = "hhttps://api-hyper-tek-games.deventiatech.com";

/** Use for img src: full URL (e.g. Cloudinary) as-is, else baseUrl + path */
function getImageUrl(image, baseUrl = BACKEND_BASE_URL) {
  if (!image || image === "" || image === null || image === undefined) return "";
  if (typeof image !== "string") return "";
  // If already a full URL (http/https), return as-is
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  // If starts with /, append to baseUrl, otherwise add /
  return baseUrl + (image.startsWith("/") ? image : "/" + image);
}

export { User_Dashboard_Url, NewsImage_Url, MarketPlace_Url, getImageUrl };
