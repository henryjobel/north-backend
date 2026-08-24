import { Router } from "express";
import { contactRoutes } from "./contactRoutes.js";
import { contactInfoRoutes } from "./contactInfoRoutes.js";
import { aboutContentRoutes } from "./aboutContentRoutes.js";
import { greenCityRoutes } from "./greenCityRoutes.js";
import healthRouter from "./health.route.js";
import { industrialCityRoutes } from "./industrialCityRoutes.js";
import { newsEventRoutes } from "./newsEventRoutes.js";
import { partnersRoutes } from "./partnersRoutes.js";
import { projectRoutes } from "./projectRoutes.js";
import { reviewRoutes } from "./reviewRoutes.js";
import { squareCityRoutes } from "./squareCityRoutes.js";
import { userRouters } from "./userRoutes.js";
import { plotBookingRoutes } from "./plotBookingRoutes.js";
import { concernRoutes } from "./concernRoutes.js";
import { menuRoutes } from "./menuRoutes.js";
import { commercialProjectRoutes } from "./commercialProjectRoutes.js";

const router = Router();

// routes
router.use("/user", userRouters);
router.use("/project", projectRoutes);
router.use("/newsEvent", newsEventRoutes);
router.use("/greenCity", greenCityRoutes);
router.use("/squareCity", squareCityRoutes);
router.use("/industrialCity", industrialCityRoutes);
router.use("/review", reviewRoutes);
router.use("/partners", partnersRoutes);
router.use("/contact", contactRoutes);
router.use("/contactInfo", contactInfoRoutes);
router.use("/about", aboutContentRoutes);
router.use("/health", healthRouter);
router.use("/plotBooking", plotBookingRoutes);
router.use("/concern", concernRoutes);
router.use("/menu", menuRoutes);
router.use("/commercialProject", commercialProjectRoutes);


export default router;
