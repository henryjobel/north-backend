import {PlotBooking} from "../models/plotBookingModel.js";


// POST /api/plot-booking
export const createPlotBooking = async (req, res) => {
  try {
    const { name, block, address, road, phone, plotNo, email, size } = req.body;

    if (!name || !block || !address || !phone || !size) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const newBooking = await PlotBooking.create({
      name,
      block,
      address,
      road,
      phone,
      plotNo,
      email,
      size,
    });

    res.status(201).json({
      message: "Plot booked successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/plot-booking (optional: to list all bookings)
export const getAllPlotBookings = async (req, res) => {
  try {
    const bookings = await PlotBooking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// GET /api/plot-booking/:id
export const getPlotBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await PlotBooking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/plot-booking/:id
export const deletePlotBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await PlotBooking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};