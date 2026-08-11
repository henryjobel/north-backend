import { Router } from "express";
import {
  createIndustrialCity,
  deleteIndustrialCity,
  downloadIndustrialCityPdf,
  getIndustrialCity,
  updateIndustrialCity,
} from "../controllers/industrialCityController.js";
import { uploadIndustrialCityAllFiles } from "../middleware/uploadMulter.js";
const router = Router();

router
  .route("/")
  .get(getIndustrialCity)
  .post(uploadIndustrialCityAllFiles, createIndustrialCity);
router.get("/:id/pdf/:kind", downloadIndustrialCityPdf);
router.put("/:id", uploadIndustrialCityAllFiles, updateIndustrialCity);
router.delete("/:id", deleteIndustrialCity);

export const industrialCityRoutes = router;
