import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    text: { type: String, trim: true },
    image: { type: String, trim: true },
  },
  { _id: false }
);

const statSchema = new mongoose.Schema(
  {
    value: { type: String, trim: true },
    label: { type: String, trim: true },
  },
  { _id: false }
);

const concernSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    routePath: { type: String, trim: true },
    theme: {
      type: String,
      enum: ["emerald", "teal", "blue", "amber"],
      default: "emerald",
    },
    eyebrow: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    heroImage: { type: String, trim: true },
    aboutImage: { type: String, trim: true },
    aboutTitle: { type: String, trim: true },
    aboutParagraphs: [{ type: String, trim: true }],
    stats: [statSchema],
    servicesTitle: { type: String, trim: true },
    servicesDescription: { type: String, trim: true },
    services: [cardSchema],
    featuresTitle: { type: String, trim: true },
    featuresDescription: { type: String, trim: true },
    features: [cardSchema],
    highlightsTitle: { type: String, trim: true },
    highlightsDescription: { type: String, trim: true },
    highlights: [cardSchema],
    processTitle: { type: String, trim: true },
    processItems: [{ type: String, trim: true }],
    heroSliderImages: [{ type: String, trim: true }],
    galleryImages: [{ type: String, trim: true }],
    ctaTitle: { type: String, trim: true },
    ctaText: { type: String, trim: true },
    ctaLabel: { type: String, trim: true },
    contactTitle: { type: String, trim: true },
    contactDescription: { type: String, trim: true },
    contactButtonLabel: { type: String, trim: true },
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

concernSchema.index({ sortOrder: 1, createdAt: 1 });

export const Concern = mongoose.model("Concern", concernSchema);

const deletedConcernSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: { type: String, trim: true },
    routePath: { type: String, trim: true },
    deletedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const DeletedConcern = mongoose.model("DeletedConcern", deletedConcernSchema);
