import { Router } from "express";
import {
  createSquareCity,
  deleteSquareCity,
  downloadSquareCityPdf,
  getSquareCity,
  updateSquareCity,
} from "../controllers/squareCityController.js";
import { uploadSquareCityAllFiles } from "../middleware/uploadMulter.js";
const router = Router();

router
  .route("/")
  .get(getSquareCity)
  .post(uploadSquareCityAllFiles, createSquareCity);
router.get("/:id/pdf/:kind", downloadSquareCityPdf);
router.put("/:id", uploadSquareCityAllFiles, updateSquareCity);
router.delete("/:id", deleteSquareCity);

export const squareCityRoutes = router;
