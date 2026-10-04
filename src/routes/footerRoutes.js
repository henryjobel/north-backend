import { Router } from "express";
import { getFooter, updateFooter } from "../controllers/footerController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { restrictTo } from "../middleware/restrictTo.js";

const router = Router();
router.get("/", getFooter);
router.put("/", isAuthenticated, restrictTo("admin"), updateFooter);

export const footerRoutes = router;
