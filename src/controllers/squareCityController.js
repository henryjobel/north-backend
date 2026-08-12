
import { SquareCity } from "../models/squareCityModel.js";
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from "../lib/cloudinaryService.js";
import { buildPdfFilename, streamCloudinaryRawDownload } from "../lib/cloudinaryDownload.js";
import compressionService from "../lib/compression.js";

const sectionImageFields = [
  "heroImage",
  "overviewImage",
  "locationImage",
  "featuresImage",
  "plotsImage",
  "goalsImage",
  "partnersImage",
  "bookingImage",
];

const parseJsonField = (data, key) => {
  if (typeof data[key] !== "string") return;
  try {
    data[key] = JSON.parse(data[key]);
  } catch {
    data[key] = [];
  }
};

const normalizeSquareCityBody = (body) => {
  const data = { ...body };
  ["goals", "locationHighlights", "plotTabs"].forEach((key) =>
    parseJsonField(data, key)
  );
  return data;
};

const uploadImageFile = async (file, folder) => {
  const compressedBuffer = await compressionService.compress(file.buffer);
  const result = await uploadToCloudinary(compressedBuffer, folder);
  return { public_id: result.public_id, url: result.url };
};

const uploadPdfFile = async (file, folder) => {
  const result = await uploadToCloudinary(file.buffer, folder, { resource_type: "raw" });
  return { public_id: result.public_id, url: result.url };
};

const uploadGalleryImages = async (files = [], folder) => {
  const uploaded = [];
  for (const file of files) {
    uploaded.push(await uploadImageFile(file, folder));
  }
  return uploaded;
};

const uploadSectionImages = async (files, currentSectionImages = {}) => {
  const uploadedSectionImages = {};

  for (const field of sectionImageFields) {
    const file = files?.[field]?.[0];
    if (!file) continue;

    if (currentSectionImages?.[field]?.public_id) {
      await deleteFromCloudinary(currentSectionImages[field].public_id);
    }

    uploadedSectionImages[field] = await uploadImageFile(file, `squareCity/sections/${field}`);
  }

  return uploadedSectionImages;
};

const deleteSectionImages = async (sectionImages = {}) => {
  await Promise.all(
    sectionImageFields
      .map((field) => sectionImages?.[field]?.public_id)
      .filter(Boolean)
      .map((publicId) => deleteFromCloudinary(publicId))
  );
};

const pdfAssetMap = {
  brochure: "brochurePdf",
  booking: "bookingPdf",
};

// Create new SquareCity
export const createSquareCity = async (req, res) => {
  try {
    const { body, files } = req;
    const data = normalizeSquareCityBody(body);

    if (files?.squareCityVideo?.[0]) {
      const result = await uploadToCloudinary(files.squareCityVideo[0].buffer, "squareCity", { resource_type: "auto" });
      data.squareCityVideo = result.url;
    }

    if (files?.galleryImages?.length) {
      data.galleryImages = await uploadGalleryImages(files.galleryImages, "squareCity/gallery");
    }

    if (files?.brochureImage?.[0]) {
      data.brochureImage = await uploadImageFile(files.brochureImage[0], "squareCity/brochure");
    }

    if (files?.brochurePdf?.[0]) {
      data.brochurePdf = await uploadPdfFile(files.brochurePdf[0], "squareCity/pdfs");
    }

    if (files?.bookingPdf?.[0]) {
      data.bookingPdf = await uploadPdfFile(files.bookingPdf[0], "squareCity/pdfs");
    }

    if (files?.mapImage?.[0]) {
      data.mapImage = await uploadImageFile(files.mapImage[0], "squareCity/map");
    }

    const sectionImages = await uploadSectionImages(files);
    if (Object.keys(sectionImages).length) {
      data.sectionImages = sectionImages;
    }

    const squareCity = await SquareCity.create(data);
    res.status(201).json({ status: "success", data: squareCity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Get squareCity
export const getSquareCity = async (req, res) => {
  try {
    const squareCity = await SquareCity.find();
    res.status(200).json({
      status: "success",
      results: squareCity.length,
      data: squareCity,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const downloadSquareCityPdf = async (req, res) => {
  try {
    const squareCity = await SquareCity.findById(req.params.id).select(
      "brochurePdf bookingPdf"
    );

    if (!squareCity) {
      return res
        .status(404)
        .json({ status: "fail", message: "Square City not found" });
    }

    const pdfKind = req.params.kind === "booking" ? "booking" : "brochure";
    const assetKey = pdfAssetMap[pdfKind];
    const asset = squareCity[assetKey];

    if (!asset?.public_id && !asset?.url) {
      return res
        .status(404)
        .json({ status: "fail", message: "PDF not found" });
    }

    const filename = buildPdfFilename("north south square city", pdfKind);
    await streamCloudinaryRawDownload({ asset, filename, res });
  } catch (err) {
    console.error("Square City PDF download error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Update SquareCity
export const updateSquareCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, files } = req;

    const squareCity = await SquareCity.findById(id);
    if (!squareCity) return res.status(404).json({ status: "error", message: "Square City not found" });

    const updateData = normalizeSquareCityBody(body);

    if (files?.squareCityVideo?.[0]) {
      if (squareCity.squareCityVideo) {
        await deleteFromCloudinary(getPublicIdFromUrl(squareCity.squareCityVideo), "video");
      }
      const result = await uploadToCloudinary(files.squareCityVideo[0].buffer, "squareCity", { resource_type: "auto" });
      updateData.squareCityVideo = result.url;
    }

    if (files?.galleryImages?.length) {
      if (squareCity.galleryImages?.length) {
        await Promise.all(squareCity.galleryImages.map((img) => deleteFromCloudinary(img.public_id)));
      }
      updateData.galleryImages = await uploadGalleryImages(files.galleryImages, "squareCity/gallery");
    }

    if (files?.brochureImage?.[0]) {
      if (squareCity.brochureImage?.public_id) {
        await deleteFromCloudinary(squareCity.brochureImage.public_id);
      }
      updateData.brochureImage = await uploadImageFile(files.brochureImage[0], "squareCity/brochure");
    }

    if (files?.brochurePdf?.[0]) {
      if (squareCity.brochurePdf?.public_id) {
        await deleteFromCloudinary(squareCity.brochurePdf.public_id, "raw");
      }
      updateData.brochurePdf = await uploadPdfFile(files.brochurePdf[0], "squareCity/pdfs");
    }

    if (files?.bookingPdf?.[0]) {
      if (squareCity.bookingPdf?.public_id) {
        await deleteFromCloudinary(squareCity.bookingPdf.public_id, "raw");
      }
      updateData.bookingPdf = await uploadPdfFile(files.bookingPdf[0], "squareCity/pdfs");
    }

    if (files?.mapImage?.[0]) {
      if (squareCity.mapImage?.public_id) {
        await deleteFromCloudinary(squareCity.mapImage.public_id);
      }
      updateData.mapImage = await uploadImageFile(files.mapImage[0], "squareCity/map");
    }

    const sectionImages = await uploadSectionImages(files, squareCity.sectionImages);
    Object.entries(sectionImages).forEach(([field, image]) => {
      updateData[`sectionImages.${field}`] = image;
    });

    if (updateData.sectionImages) {
      delete updateData.sectionImages;
    }

    const updatedSquareCity = await SquareCity.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    res.status(200).json({ status: "success", data: updatedSquareCity });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Delete SquareCity
export const deleteSquareCity = async (req, res) => {
  try {
    const squareCity = await SquareCity.findById(req.params.id);
    if (!squareCity) return res.status(404).json({ status: "fail", message: "Square City not found" });

    if (squareCity.squareCityVideo) {
      await deleteFromCloudinary(getPublicIdFromUrl(squareCity.squareCityVideo), "video");
    }
    if (squareCity.galleryImages?.length) {
      await Promise.all(squareCity.galleryImages.map((img) => deleteFromCloudinary(img.public_id)));
    }
    if (squareCity.brochureImage?.public_id) {
      await deleteFromCloudinary(squareCity.brochureImage.public_id);
    }
    if (squareCity.brochurePdf?.public_id) {
      await deleteFromCloudinary(squareCity.brochurePdf.public_id, "raw");
    }
    if (squareCity.bookingPdf?.public_id) {
      await deleteFromCloudinary(squareCity.bookingPdf.public_id, "raw");
    }
    if (squareCity.mapImage?.public_id) {
      await deleteFromCloudinary(squareCity.mapImage.public_id);
    }
    await deleteSectionImages(squareCity.sectionImages);

    await SquareCity.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: "success", message: "Square City deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
