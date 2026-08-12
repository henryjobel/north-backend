import { GreenCity } from "../models/greenCityModel.js";
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

const normalizeGreenCityBody = (body) => {
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

    uploadedSectionImages[field] = await uploadImageFile(file, `greenCity/sections/${field}`);
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

// Create new GreenCity entry
export const createGreenCity = async (req, res) => {
  try {
    const { body, files } = req;
    const data = normalizeGreenCityBody(body);

    // Video
    if (files?.greenCityVideo?.[0]) {
      const result = await uploadToCloudinary(files.greenCityVideo[0].buffer, "greenCity", { resource_type: "auto" });
      data.greenCityVideo = result.url;
    }

    // Gallery images
    if (files?.galleryImages?.length) {
      data.galleryImages = await uploadGalleryImages(files.galleryImages, "greenCity/gallery");
    }

    // Brochure image
    if (files?.brochureImage?.[0]) {
      data.brochureImage = await uploadImageFile(files.brochureImage[0], "greenCity/brochure");
    }

    if (files?.brochurePdf?.[0]) {
      data.brochurePdf = await uploadPdfFile(files.brochurePdf[0], "greenCity/pdfs");
    }

    if (files?.bookingPdf?.[0]) {
      data.bookingPdf = await uploadPdfFile(files.bookingPdf[0], "greenCity/pdfs");
    }

    if (files?.mapImage?.[0]) {
      data.mapImage = await uploadImageFile(files.mapImage[0], "greenCity/map");
    }

    const sectionImages = await uploadSectionImages(files);
    if (Object.keys(sectionImages).length) {
      data.sectionImages = sectionImages;
    }

    const greenCity = await GreenCity.create(data);
    res.status(201).json({ status: "success", data: greenCity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Get all GreenCity
export const getGreenCity = async (req, res) => {
  try {
    const greenCity = await GreenCity.find();
    res.status(200).json({
      status: "success",
      results: greenCity.length,
      data: greenCity,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const downloadGreenCityPdf = async (req, res) => {
  try {
    const greenCity = await GreenCity.findById(req.params.id).select(
      "brochurePdf bookingPdf"
    );

    if (!greenCity) {
      return res
        .status(404)
        .json({ status: "fail", message: "Green City not found" });
    }

    const pdfKind = req.params.kind === "booking" ? "booking" : "brochure";
    const assetKey = pdfAssetMap[pdfKind];
    const asset = greenCity[assetKey];

    if (!asset?.public_id && !asset?.url) {
      return res
        .status(404)
        .json({ status: "fail", message: "PDF not found" });
    }

    const filename = buildPdfFilename("north south green city", pdfKind);
    await streamCloudinaryRawDownload({ asset, filename, res });
  } catch (err) {
    console.error("Green City PDF download error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Update GreenCity
export const updateGreenCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, files } = req;

    const greenCity = await GreenCity.findById(id);
    if (!greenCity) return res.status(404).json({ status: "error", message: "Green City not found" });

    const updateData = normalizeGreenCityBody(body);

    // Video
    if (files?.greenCityVideo?.[0]) {
      if (greenCity.greenCityVideo) {
        await deleteFromCloudinary(getPublicIdFromUrl(greenCity.greenCityVideo), "video");
      }
      const result = await uploadToCloudinary(files.greenCityVideo[0].buffer, "greenCity", { resource_type: "auto" });
      updateData.greenCityVideo = result.url;
    }

    // Gallery images – replace all if new ones uploaded
    if (files?.galleryImages?.length) {
      // Delete old gallery images from cloudinary
      if (greenCity.galleryImages?.length) {
        await Promise.all(
          greenCity.galleryImages.map((img) => deleteFromCloudinary(img.public_id))
        );
      }
      updateData.galleryImages = await uploadGalleryImages(files.galleryImages, "greenCity/gallery");
    }

    // Brochure image
    if (files?.brochureImage?.[0]) {
      if (greenCity.brochureImage?.public_id) {
        await deleteFromCloudinary(greenCity.brochureImage.public_id);
      }
      updateData.brochureImage = await uploadImageFile(files.brochureImage[0], "greenCity/brochure");
    }

    if (files?.brochurePdf?.[0]) {
      if (greenCity.brochurePdf?.public_id) {
        await deleteFromCloudinary(greenCity.brochurePdf.public_id, "raw");
      }
      updateData.brochurePdf = await uploadPdfFile(files.brochurePdf[0], "greenCity/pdfs");
    }

    if (files?.bookingPdf?.[0]) {
      if (greenCity.bookingPdf?.public_id) {
        await deleteFromCloudinary(greenCity.bookingPdf.public_id, "raw");
      }
      updateData.bookingPdf = await uploadPdfFile(files.bookingPdf[0], "greenCity/pdfs");
    }

    if (files?.mapImage?.[0]) {
      if (greenCity.mapImage?.public_id) {
        await deleteFromCloudinary(greenCity.mapImage.public_id);
      }
      updateData.mapImage = await uploadImageFile(files.mapImage[0], "greenCity/map");
    }

    const sectionImages = await uploadSectionImages(files, greenCity.sectionImages);
    Object.entries(sectionImages).forEach(([field, image]) => {
      updateData[`sectionImages.${field}`] = image;
    });

    if (updateData.sectionImages) {
      delete updateData.sectionImages;
    }

    const updatedGreenCity = await GreenCity.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    res.status(200).json({ status: "success", data: updatedGreenCity });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Delete GreenCity
export const deleteGreenCity = async (req, res) => {
  try {
    const greenCity = await GreenCity.findById(req.params.id);
    if (!greenCity) return res.status(404).json({ status: "fail", message: "Green City not found" });

    if (greenCity.greenCityVideo) {
      await deleteFromCloudinary(getPublicIdFromUrl(greenCity.greenCityVideo), "video");
    }
    if (greenCity.galleryImages?.length) {
      await Promise.all(greenCity.galleryImages.map((img) => deleteFromCloudinary(img.public_id)));
    }
    if (greenCity.brochureImage?.public_id) {
      await deleteFromCloudinary(greenCity.brochureImage.public_id);
    }
    if (greenCity.brochurePdf?.public_id) {
      await deleteFromCloudinary(greenCity.brochurePdf.public_id, "raw");
    }
    if (greenCity.bookingPdf?.public_id) {
      await deleteFromCloudinary(greenCity.bookingPdf.public_id, "raw");
    }
    if (greenCity.mapImage?.public_id) {
      await deleteFromCloudinary(greenCity.mapImage.public_id);
    }
    await deleteSectionImages(greenCity.sectionImages);

    await GreenCity.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: "success", message: "Green City deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
