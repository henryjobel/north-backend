import mongoose from "mongoose";

const plotBookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    block: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    road: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    plotNo: { type: String, trim: true },
    email: { type: String, trim: true },
    size: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const PlotBooking = mongoose.model("PlotBooking", plotBookingSchema);
