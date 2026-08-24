
import { Router } from "express";
import {
  createHomeSlider,
  getHomeSliders,
  updateHomeSlider,
  deleteHomeSlider
} from "../controllers/homeSliderController.js";
import { uploadHomeSlider } from "../middleware/uploadMulter.js";

const router = Router();

router.route("/")
  .get(getHomeSliders)
  .post(uploadHomeSlider, createHomeSlider);

router.route("/:id")
  .put(uploadHomeSlider, updateHomeSlider)
  .delete(deleteHomeSlider);

export const homeSliderRoutes = router;

