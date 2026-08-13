import http from "http";
import https from "https";
import cloudinary from "./cloudinaryService.js";

const sanitizeFilenamePart = (value) =>
  (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildPdfFilename = (...parts) => {
  const cleaned = parts.map(sanitizeFilenamePart).filter(Boolean);
  return `${cleaned.join("-") || "document"}.pdf`;
};

export const getRawPublicId = (asset) => {
  if (!asset) return null;
  if (typeof asset === "string") return asset;

  const assetUrl = asset.url || asset.secure_url;
  if (!assetUrl || !assetUrl.includes("cloudinary.com")) {
    return asset.public_id || null;
  }

  try {
    const parts = assetUrl.split("/upload/");
    const publicIdFromUrl = parts[1].replace(/^v\d+\//, "").replace(/\?.*$/, "");
    return publicIdFromUrl || asset.public_id || null;
  } catch {
    return asset.public_id || null;
  }
};

export const streamCloudinaryRawDownload = ({ asset, filename, res }) =>
  new Promise((resolve, reject) => {
    const publicId = getRawPublicId(asset);

    if (!publicId) {
      res.status(422).json({ status: "fail", message: "Invalid PDF asset" });
      resolve(false);
      return;
    }

    const fetchUrl = cloudinary.utils.private_download_url(publicId, "", {
      resource_type: "raw",
      type: "upload",
    });

    const client = fetchUrl.startsWith("https") ? https : http;
    const upstreamRequest = client.get(fetchUrl, (upstream) => {
      if (upstream.statusCode !== 200) {
        res
          .status(upstream.statusCode || 502)
          .json({ status: "error", message: "Could not fetch PDF from storage" });
        resolve(false);
        return;
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      if (upstream.headers["content-length"]) {
        res.setHeader("Content-Length", upstream.headers["content-length"]);
      }

      upstream.pipe(res);
      upstream.on("end", () => resolve(true));
      upstream.on("error", reject);
    });

    upstreamRequest.on("error", reject);
  });
