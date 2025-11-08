import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export function extractPublicId(url: string): string | null {
  if (!url || !url.includes("/upload/")) return null;
  return url.split("/upload/")[1]
    .split("/")
    .slice(1)
    .join("/")
    .split(".")[0]
    .trim();
}