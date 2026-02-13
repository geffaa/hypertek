const Dashboard_Base_Url="https://api-hyper-tek-games.deventiatech.com/api"
const Image_Base_Url="https://api-hyper-tek-games.deventiatech.com"

// const Dashboard_Base_Url="http://localhost:4700/api"
// const Image_Base_Url="http://localhost:4700"

/** Use for img src: full URL (Cloudinary) as-is, else backend base + path */
function getImageUrl(image, baseUrl = Image_Base_Url) {
  if (!image || image === "" || image === null || image === undefined) return "";
  if (typeof image !== "string") return "";
  // If already a full URL (http/https), return as-is
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  // If starts with /, append to baseUrl, otherwise add /
  return baseUrl + (image.startsWith("/") ? image : "/" + image);
}

export { Dashboard_Base_Url, Image_Base_Url, getImageUrl };