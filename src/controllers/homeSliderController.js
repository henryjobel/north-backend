
import { HomeSlider } from "../models/homeSliderModel.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../lib/cloudinaryService.js";
import compressionService from "../lib/compression.js";

const defaultHomeSlides = [
  {
    eyebrow: "North South Group",
    title: "Redefining Modern Living",
    subtitle: "Residential, hospitality, and land development projects shaped around trust, location, and long-term value.",
    sortOrder: 1,
    image: { public_id: "static/home-slider-1", url: "/assets/Hotel.png" },
  },
  {
    eyebrow: "Land Development",
    title: "Invest For A Better Tomorrow",
    subtitle: "Planned communities and strategic land opportunities for buyers, investors, and landowners.",
    sortOrder: 2,
    image: { public_id: "static/home-slider-2", url: "/assets/Land1.png" },
  },
  {
    eyebrow: "Trusted Partnership",
    title: "Build Your Sanctuary With Credibility",
    subtitle: "A practical route for landowners and families looking for reliable real estate development.",
    sortOrder: 3,
    image: { public_id: "static/home-slider-3", url: "/assets/Land2.png" },
  },
  {
    eyebrow: "Real Estate",
    title: "A New Standard Of Living",
    subtitle: "Homes and townships designed for comfort, connectivity, and everyday convenience.",
    sortOrder: 4,
    image: { public_id: "static/home-slider-4", url: "/assets/Apartment.jpg" },
  },
];

let homeSliderSeedPromise = null;

const uploadImageFile = async (file, folder) => {
  const compressedBuffer = await compressionService.compress(file.buffer);
  const result = await uploadToCloudinary(compressedBuffer, folder);
  return { public_id: result.public_id, url: result.url };
};

const ensureDefaultHomeSlides = async () => {
  if (homeSliderSeedPromise) return homeSliderSeedPromise;

  homeSliderSeedPromise = (async () => {
    const count = await HomeSlider.countDocuments();
    if (count > 0) return;

    await HomeSlider.insertMany(defaultHomeSlides);
  })().catch((err) => {
    homeSliderSeedPromise = null;
    throw err;
  });

  return homeSliderSeedPromise;
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
    await ensureDefaultHomeSlides();
    const slides = await HomeSlider.find().sort({ sortOrder: 1, createdAt: 1 });
    return res.status(200).json({ status: "success", data: slides });
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

