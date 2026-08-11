import { Router } from "express";
import {
  createReview,
  deleteReview,
  getAllReview,
  getReviewById,
  updateReview,
} from "../controllers/reviewController.js";
import { parseFormData } from "../middleware/uploadMulter.js";

const router = Router();

router.route("/").get(getAllReview).post(parseFormData, createReview);
router.get("/:id", getReviewById);
router.put("/:id", parseFormData, updateReview);
router.delete("/:id", deleteReview);

export const reviewRoutes = router;
