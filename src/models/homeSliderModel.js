
import mongoose from "mongoose";

const homeSliderSchema = new mongoose.Schema(
  {
    image: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
    eyebrow: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const HomeSlider = mongoose.model("HomeSlider", homeSliderSchema);

