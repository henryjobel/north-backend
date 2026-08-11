import { Router } from "express";
import {
  createGreenCity,
  deleteGreenCity,
  downloadGreenCityPdf,
  getGreenCity,
  updateGreenCity,
} from "../controllers/greenCityController.js";
import { uploadGreenCityAllFiles } from "../middleware/uploadMulter.js";
const router = Router();

router
  .route("/")
  .get(getGreenCity)
  .post(uploadGreenCityAllFiles, createGreenCity);
router.get("/:id/pdf/:kind", downloadGreenCityPdf);
router.put("/:id", uploadGreenCityAllFiles, updateGreenCity);
router.delete("/:id", deleteGreenCity);

export const greenCityRoutes = router;
