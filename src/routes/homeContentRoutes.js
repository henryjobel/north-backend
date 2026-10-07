import { Router } from "express";
import { getHomeContent, updateHomeContent } from "../controllers/homeContentController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { restrictTo } from "../middleware/restrictTo.js";

const router = Router();
router.get("/", getHomeContent);
router.put("/", isAuthenticated, restrictTo("admin"), updateHomeContent);

export const homeContentRoutes = router;
