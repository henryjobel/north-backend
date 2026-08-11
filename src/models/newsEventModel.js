import mongoose from "mongoose";

const newsEventSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String }, // map URL or string
    image: [{ type: String }], // array of images
  },
  { timestamps: true }
);

export const NewsEvent = mongoose.model("NewsEvent", newsEventSchema);

