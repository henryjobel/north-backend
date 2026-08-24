import { Router } from "express";
import {
  createCommercialProject,
  getCommercialProject,
  updateCommercialProject,
} from "../controllers/commercialProjectController.js";
import { uploadCommercialProjectAllFiles } from "../middleware/uploadMulter.js";

const router = Router();

router
  .route("/")
  .get(getCommercialProject)
  .post(uploadCommercialProjectAllFiles, createCommercialProject);

router.put("/:id", uploadCommercialProjectAllFiles, updateCommercialProject);

export const commercialProjectRoutes = router;

