import { CommercialProject } from "../models/commercialProjectModel.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../lib/cloudinaryService.js";
import compressionService from "../lib/compression.js";

const parseJsonField = (data, key) => {
  if (typeof data[key] !== "string") return;
  try {
    data[key] = JSON.parse(data[key]);
  } catch {
    data[key] = [];
  }
};

const normalizeBody = (body) => {
  const data = { ...body };
  ["stats", "highlights", "specs", "locationBenefits"].forEach((key) =>
    parseJsonField(data, key)
  );
  return data;
};

const singleImageFields = [
  "heroImage",
  "overviewImage",
  "architectureImage1",
  "architectureImage2",
  "mapImage",
  "videoThumbnail",
];

const uploadImageFile = async (file, folder) => {
  const compressedBuffer = await compressionService.compress(file.buffer);
  const result = await uploadToCloudinary(compressedBuffer, folder);
  return { public_id: result.public_id, url: result.url };
};

const uploadGalleryImages = async (files, folder) => {
  return await Promise.all(
    files.map(async (file) => {
      const compressedBuffer = await compressionService.compress(file.buffer);
      const result = await uploadToCloudinary(compressedBuffer, folder);
      return { public_id: result.public_id, url: result.url };
    })
  );
};

export const createCommercialProject = async (req, res) => {
  try {
    const { body, files } = req;
    const data = normalizeBody(body);

    for (const field of singleImageFields) {
      if (files?.[field]?.[0]) {
        data[field] = await uploadImageFile(files[field][0], `commercialProject/${field}`);
      }
    }

    if (files?.galleryImages?.length) {
      data.galleryImages = await uploadGalleryImages(files.galleryImages, "commercialProject/gallery");
    }

    const project = await CommercialProject.create(data);
    res.status(201).json({ status: "success", data: project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getCommercialProject = async (req, res) => {
  try {
    const project = await CommercialProject.find();
    res.status(200).json({
      status: "success",
      data: project.length > 0 ? project[0] : null, // Since we only need one page content
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const updateCommercialProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, files } = req;

    const project = await CommercialProject.findById(id);
    if (!project) return res.status(404).json({ status: "error", message: "Commercial Project not found" });

    const updateData = normalizeBody(body);

    for (const field of singleImageFields) {
      if (files?.[field]?.[0]) {
        if (project[field]?.public_id) {
          await deleteFromCloudinary(project[field].public_id);
        }
        updateData[field] = await uploadImageFile(files[field][0], `commercialProject/${field}`);
      }
    }

    // Keep existing gallery images if passed as stringified JSON (often done in these CMS forms)
    if (typeof body.existingGalleryImages === "string") {
      try {
        const existingImages = JSON.parse(body.existingGalleryImages);
        
        // Find which images were deleted
        const existingIds = existingImages.map(img => img.public_id);
        const imagesToDelete = project.galleryImages.filter(img => !existingIds.includes(img.public_id));
        
        for (const img of imagesToDelete) {
          if (img.public_id) await deleteFromCloudinary(img.public_id);
        }
        
        updateData.galleryImages = existingImages;
      } catch (e) {
        console.error("Failed to parse existing gallery images");
      }
    }

    if (files?.galleryImages?.length) {
      const newGalleryImages = await uploadGalleryImages(files.galleryImages, "commercialProject/gallery");
      updateData.galleryImages = updateData.galleryImages 
        ? [...updateData.galleryImages, ...newGalleryImages] 
        : [...(project.galleryImages || []), ...newGalleryImages];
    }

    const updatedProject = await CommercialProject.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    res.status(200).json({ status: "success", data: updatedProject });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

