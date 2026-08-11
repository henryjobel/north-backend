import { Router } from "express";

import { parseFormData } from "../middleware/uploadMulter.js";
import {
  createPlotBooking,
  deletePlotBooking,
  getAllPlotBookings,
  getPlotBookingById,
} from "../controllers/plotBookingController.js";

const router = Router();

router.post("/", parseFormData, createPlotBooking);
router.get("/", getAllPlotBookings);
router.get("/:id", getPlotBookingById);
router.delete("/:id", deletePlotBooking);
export const plotBookingRoutes = router;
