import { Router } from "express";
import { getContactInfo, updateContactInfo } from "../controllers/contactInfoController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { restrictTo } from "../middleware/restrictTo.js";

const router = Router();

router.get("/", getContactInfo);
router.put("/", isAuthenticated, restrictTo("admin"), updateContactInfo);

export const contactInfoRoutes = router;
