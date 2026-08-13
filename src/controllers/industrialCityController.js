import { IndustrialCity } from "../models/industrialCityModel.js";
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from "../lib/cloudinaryService.js";
import { buildPdfFilename, streamCloudinaryRawDownload } from "../lib/cloudinaryDownload.js";
import compressionService from "../lib/compression.js";

const parseJsonField = (data, key) => {
  if (typeof data[key] !== "string") return;
  try {
    data[key] = JSON.parse(data[key]);
  } catch {
    data[key] = [];
  }
};

const normalizeIndustrialCityBody = (body) => {
  const data = { ...body };
  ["goals", "locationHighlights", "plotTabs"].forEach((key) =>
    parseJsonField(data, key)
  );
  return data;
};

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

const uploadImageFile = async (file, folder) => {
  const compressedBuffer = await compressionService.compress(file.buffer);
  const result = await uploadToCloudinary(compressedBuffer, folder);
  return { public_id: result.public_id, url: result.url };
};

const uploadPdfFile = async (file, folder) => {
  const safeBaseName =
    file.originalname
      ?.replace(/\.pdf$/i, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "brochure";
  const result = await uploadToCloudinary(file.buffer, folder, {
    resource_type: "raw",
    public_id: `${safeBaseName}-${Date.now()}.pdf`,
  });
  return { public_id: result.public_id, url: result.url };
};

const parseAssetField = (body, key) => {
  const prefix = key.replace(/Asset$/, "");
  if (body?.[`${prefix}Url`]) {
    return {
      public_id: body[`${prefix}PublicId`] || "",
      url: body[`${prefix}Url`],
    };
  }

  if (!body?.[key]) return null;
  try {
    const asset = typeof body[key] === "string" ? JSON.parse(body[key]) : body[key];
    if (!asset?.url) return null;
    return {
      public_id: asset.public_id || "",
      url: asset.url,
    };
  } catch {
    return null;
  }
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

    uploadedSectionImages[field] = await uploadImageFile(file, `industrialCity/sections/${field}`);
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

// Create new IndustrialCity
export const createIndustrialCity = async (req, res) => {
  try {
    const { body, files } = req;
    const data = normalizeIndustrialCityBody(body);

    if (files?.industrialCityVideo?.[0]) {
      const result = await uploadToCloudinary(files.industrialCityVideo[0].buffer, "industrialCity", { resource_type: "auto" });
      data.industrialCityVideo = result.url;
    }

    if (files?.galleryImages?.length) {
      data.galleryImages = await uploadGalleryImages(files.galleryImages, "industrialCity/gallery");
    }

    if (files?.brochureImage?.[0]) {
      data.brochureImage = await uploadImageFile(files.brochureImage[0], "industrialCity/brochure");
    }

    if (files?.brochurePdf?.[0]) {
      data.brochurePdf = await uploadPdfFile(files.brochurePdf[0], "industrialCity/pdfs");
    } else {
      const brochurePdfAsset = parseAssetField(body, "brochurePdfAsset");
      if (brochurePdfAsset) data.brochurePdf = brochurePdfAsset;
    }

    if (files?.bookingPdf?.[0]) {
      data.bookingPdf = await uploadPdfFile(files.bookingPdf[0], "industrialCity/pdfs");
    } else {
      const bookingPdfAsset = parseAssetField(body, "bookingPdfAsset");
      if (bookingPdfAsset) data.bookingPdf = bookingPdfAsset;
    }

    if (files?.mapImage?.[0]) {
      data.mapImage = await uploadImageFile(files.mapImage[0], "industrialCity/map");
    }

    const sectionImages = await uploadSectionImages(files);
    if (Object.keys(sectionImages).length) {
      data.sectionImages = sectionImages;
    }

    const industrialCity = await IndustrialCity.create(data);
    res.status(201).json({ status: "success", data: industrialCity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Get all Industrial City
export const getIndustrialCity = async (req, res) => {
  try {
    const industrialCity = await IndustrialCity.find();
    res.status(200).json({
      status: "success",
      results: industrialCity.length,
      data: industrialCity,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const downloadIndustrialCityPdf = async (req, res) => {
  try {
    const industrialCity = await IndustrialCity.findById(req.params.id).select(
      "brochurePdf bookingPdf"
    );

    if (!industrialCity) {
      return res
        .status(404)
        .json({ status: "fail", message: "Industrial City not found" });
    }

    const pdfKind = req.params.kind === "booking" ? "booking" : "brochure";
    const assetKey = pdfAssetMap[pdfKind];
    const asset = industrialCity[assetKey];

    if (!asset?.public_id && !asset?.url) {
      return res
        .status(404)
        .json({ status: "fail", message: "PDF not found" });
    }

    const filename = buildPdfFilename("north south industrial city", pdfKind);
    await streamCloudinaryRawDownload({ asset, filename, res });
  } catch (err) {
    console.error("Industrial City PDF download error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Update IndustrialCity
export const updateIndustrialCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, files } = req;

    const industrialCity = await IndustrialCity.findById(id);
    if (!industrialCity) return res.status(404).json({ status: "error", message: "Industrial City not found" });

    const updateData = normalizeIndustrialCityBody(body);

    if (files?.industrialCityVideo?.[0]) {
      if (industrialCity.industrialCityVideo) {
        await deleteFromCloudinary(getPublicIdFromUrl(industrialCity.industrialCityVideo), "video");
      }
      const result = await uploadToCloudinary(files.industrialCityVideo[0].buffer, "industrialCity", { resource_type: "auto" });
      updateData.industrialCityVideo = result.url;
    }

    if (files?.galleryImages?.length) {
      if (industrialCity.galleryImages?.length) {
        await Promise.all(industrialCity.galleryImages.map((img) => deleteFromCloudinary(img.public_id)));
      }
      updateData.galleryImages = await uploadGalleryImages(files.galleryImages, "industrialCity/gallery");
    }

    if (files?.brochureImage?.[0]) {
      if (industrialCity.brochureImage?.public_id) {
        await deleteFromCloudinary(industrialCity.brochureImage.public_id);
      }
      updateData.brochureImage = await uploadImageFile(files.brochureImage[0], "industrialCity/brochure");
    }

    if (files?.brochurePdf?.[0]) {
      if (industrialCity.brochurePdf?.public_id) {
        await deleteFromCloudinary(industrialCity.brochurePdf.public_id, "raw");
      }
      updateData.brochurePdf = await uploadPdfFile(files.brochurePdf[0], "industrialCity/pdfs");
    } else {
      const brochurePdfAsset = parseAssetField(body, "brochurePdfAsset");
      if (brochurePdfAsset) {
        if (industrialCity.brochurePdf?.public_id && industrialCity.brochurePdf.public_id !== brochurePdfAsset.public_id) {
          await deleteFromCloudinary(industrialCity.brochurePdf.public_id, "raw");
        }
        updateData.brochurePdf = brochurePdfAsset;
      }
    }

    if (files?.bookingPdf?.[0]) {
      if (industrialCity.bookingPdf?.public_id) {
        await deleteFromCloudinary(industrialCity.bookingPdf.public_id, "raw");
      }
      updateData.bookingPdf = await uploadPdfFile(files.bookingPdf[0], "industrialCity/pdfs");
    } else {
      const bookingPdfAsset = parseAssetField(body, "bookingPdfAsset");
      if (bookingPdfAsset) {
        if (industrialCity.bookingPdf?.public_id && industrialCity.bookingPdf.public_id !== bookingPdfAsset.public_id) {
          await deleteFromCloudinary(industrialCity.bookingPdf.public_id, "raw");
        }
        updateData.bookingPdf = bookingPdfAsset;
      }
    }

    if (files?.mapImage?.[0]) {
      if (industrialCity.mapImage?.public_id) {
        await deleteFromCloudinary(industrialCity.mapImage.public_id);
      }
      updateData.mapImage = await uploadImageFile(files.mapImage[0], "industrialCity/map");
    }

    const sectionImages = await uploadSectionImages(files, industrialCity.sectionImages);
    Object.entries(sectionImages).forEach(([field, image]) => {
      updateData[`sectionImages.${field}`] = image;
    });

    if (updateData.sectionImages) {
      delete updateData.sectionImages;
    }
    delete updateData.brochurePdfAsset;
    delete updateData.bookingPdfAsset;

    const updatedIndustrialCity = await IndustrialCity.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    res.status(200).json({ status: "success", data: updatedIndustrialCity });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Delete IndustrialCity
export const deleteIndustrialCity = async (req, res) => {
  try {
    const industrialCity = await IndustrialCity.findById(req.params.id);
    if (!industrialCity) return res.status(404).json({ status: "fail", message: "Industrial City not found" });

    if (industrialCity.industrialCityVideo) {
      await deleteFromCloudinary(getPublicIdFromUrl(industrialCity.industrialCityVideo), "video");
    }
    if (industrialCity.galleryImages?.length) {
      await Promise.all(industrialCity.galleryImages.map((img) => deleteFromCloudinary(img.public_id)));
    }
    if (industrialCity.brochureImage?.public_id) {
      await deleteFromCloudinary(industrialCity.brochureImage.public_id);
    }
    if (industrialCity.brochurePdf?.public_id) {
      await deleteFromCloudinary(industrialCity.brochurePdf.public_id, "raw");
    }
    if (industrialCity.bookingPdf?.public_id) {
      await deleteFromCloudinary(industrialCity.bookingPdf.public_id, "raw");
    }
    if (industrialCity.mapImage?.public_id) {
      await deleteFromCloudinary(industrialCity.mapImage.public_id);
    }
    await deleteSectionImages(industrialCity.sectionImages);

    await IndustrialCity.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: "success", message: "Industrial City deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
