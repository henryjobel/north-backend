import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    name: { type: String }, 
    designation: { type: String }, 
    reviewVideo: { type: String },
  },
  { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);

