import { NewsEvent } from "../models/newsEventModel.js";
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from "../lib/cloudinaryService.js";
import compressionService from "../lib/compression.js";

// Create new NewsEvent
// Assuming Multer middleware already ran before this
export const createNewsEvent = async (req, res) => {
  try {
    const { body, files } = req;
    if (files?.image?.length) {
      body.image = await Promise.all(
        files.image.map(async (f) => {
          const compressedBuffer = await compressionService.compress(f.buffer);
          const result = await uploadToCloudinary(compressedBuffer, "newsEvent");
          return result.url;
        })
      );
    } else {
      body.image = [];
    }

    const newsEvent = await NewsEvent.create(body);

    res.status(201).json({
      status: "success",
      data: newsEvent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// Get all newsEvent
export const getAllNewsEvent = async (req, res) => {
  try {
    const newsEvent = await NewsEvent.find();
    res.status(200).json({
      status: "success",
      results: newsEvent.length,
      data: newsEvent,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Get single newsEvent by ID
export const getNewsEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const newsEvent = await NewsEvent.findById(id);

    if (!newsEvent) {
      return res
        .status(404)
        .json({ status: "fail", message: "News & Event not found" });
    }

    res.status(200).json({ status: "success", data: newsEvent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Update newsEvent by ID

export const updateNewsEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, files } = req;

    const newsEvent = await NewsEvent.findById(id);
    if (!newsEvent) return res.status(404).json({ status: "error", message: "News & Event not found" });

    const updateData = { ...body };

    if (files?.image?.length) {
      newsEvent.image?.forEach((u) => deleteFromCloudinary(getPublicIdFromUrl(u)));
      updateData.image = await Promise.all(
        files.image.map(async (f) => {
          const compressedBuffer = await compressionService.compress(f.buffer);
          const result = await uploadToCloudinary(compressedBuffer, "newsEvent");
          return result.url;
        })
      );
    }

    /* ---------- Update ---------- */
    const updatedNewsEvent = await NewsEvent.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: updatedNewsEvent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// Delete newsEvent

export const deleteNewsEvent = async (req, res) => {
  try {
    const newsEvent = await NewsEvent.findById(req.params.id);

    if (!newsEvent)
      return res
        .status(404)
        .json({ status: "fail", message: "News & Event not found" });

    newsEvent.image?.forEach((u) => deleteFromCloudinary(getPublicIdFromUrl(u)));
    await NewsEvent.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      message: "News & Event and images deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
