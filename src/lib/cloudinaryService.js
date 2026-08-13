import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from "../config/siteEnv.js";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder name
 * @param {Object} options - Extra options (resource_type etc.)
 * @returns {Promise<{url: string, public_id: string}>}
 */
export const uploadToCloudinary = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: "image",
      format: "webp",
      ...options,
    };

    if (uploadOptions.resource_type !== "image") {
      delete uploadOptions.format;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary by public_id
 * @param {string} public_id
 * @param {string} resource_type - "image" | "video" | "raw"
 */
export const deleteFromCloudinary = async (public_id, resource_type = "image") => {
  if (!public_id) return;
  try {
    await cloudinary.uploader.destroy(public_id, { resource_type });
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
  }
};

/**
 * Extract public_id from a Cloudinary URL
 * e.g. https://res.cloudinary.com/xxx/image/upload/v123/folder/filename.jpg
 * returns "folder/filename"
 */
export const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    const withVersion = parts[1]; // v123/folder/filename.jpg
    const withoutVersion = withVersion.replace(/^v\d+\//, "");
    return withoutVersion.replace(/\.[^/.?]+(?:\?.*)?$/, ""); // remove extension
  } catch {
    return null;
  }
};

export const getResourceTypeFromUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return "image";
  if (url.includes("/raw/upload/")) return "raw";
  if (url.includes("/video/upload/")) return "video";
  return "image";
};

export default cloudinary;
