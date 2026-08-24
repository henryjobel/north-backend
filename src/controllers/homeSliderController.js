
import { HomeSlider } from "../models/homeSliderModel.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../lib/cloudinaryService.js";
import compressionService from "../lib/compression.js";

const uploadImageFile = async (file, folder) => {
  const compressedBuffer = await compressionService.compressImage(file.buffer);
  const result = await uploadToCloudinary(compressedBuffer, folder);
  return { public_id: result.public_id, url: result.url };
};

export const createHomeSlider = async (req, res) => {
  try {
    const { eyebrow, title, subtitle, sortOrder } = req.body;
    let image = null;

    if (req.file) {
      image = await uploadImageFile(req.file, "homeSlider");
    } else {
      return res.status(400).json({ status: "error", message: "Image is required" });
    }

    const slide = await HomeSlider.create({ eyebrow, title, subtitle, sortOrder, image });
    res.status(201).json({ status: "success", data: slide });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getHomeSliders = async (req, res) => {
  try {
    const slides = await HomeSlider.find().sort({ sortOrder: 1, createdAt: 1 });
    res.status(200).json({ status: "success", data: slides });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const updateHomeSlider = async (req, res) => {
  try {
    const { id } = req.params;
    const { eyebrow, title, subtitle, sortOrder } = req.body;
    const slide = await HomeSlider.findById(id);
    if (!slide) return res.status(404).json({ status: "error", message: "Slide not found" });

    const updateData = { eyebrow, title, subtitle, sortOrder };

    if (req.file) {
      if (slide.image?.public_id) {
        await deleteFromCloudinary(slide.image.public_id);
      }
      updateData.image = await uploadImageFile(req.file, "homeSlider");
    }

    const updatedSlide = await HomeSlider.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    res.status(200).json({ status: "success", data: updatedSlide });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const deleteHomeSlider = async (req, res) => {
  try {
    const { id } = req.params;
    const slide = await HomeSlider.findById(id);
    if (!slide) return res.status(404).json({ status: "error", message: "Slide not found" });

    if (slide.image?.public_id) {
      await deleteFromCloudinary(slide.image.public_id);
    }
    
    await HomeSlider.findByIdAndDelete(id);
    res.status(200).json({ status: "success", message: "Slide deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

