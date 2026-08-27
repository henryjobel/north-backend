import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    label: { type: String, required: true, trim: true },
    to: { type: String, trim: true },
    href: { type: String, trim: true },
    external: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    source: {
      type: String,
      enum: ["static", "concern", "custom"],
      default: "static",
    },
  },
  { timestamps: true }
);

menuItemSchema.index({ sortOrder: 1, createdAt: 1 });

export const MenuItem = mongoose.model("MenuItem", menuItemSchema);
