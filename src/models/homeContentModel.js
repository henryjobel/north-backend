import mongoose from "mongoose";
import { defaultHomeContent } from "../data/defaultHomeContent.js";

const homeContentSchema = new mongoose.Schema(
  {
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: () => structuredClone(defaultHomeContent),
    },
  },
  { timestamps: true, minimize: false }
);

export const HomeContent = mongoose.model("HomeContent", homeContentSchema);
