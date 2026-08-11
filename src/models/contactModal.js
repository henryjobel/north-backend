import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String },
    number: { type: String }, 
    email: { type: String }, 
    address: { type: String }, 
    message: { type: String }, 
  },
  { timestamps: true }
);

export const Contact = mongoose.model("Contact", contactSchema);

