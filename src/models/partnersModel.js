import mongoose from "mongoose";

const partnersSchema = new mongoose.Schema(
  {
    partnersImage: { type: String },
  },
  { timestamps: true }
);

export const Partners = mongoose.model("Partners", partnersSchema);

