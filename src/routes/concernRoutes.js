import { Router } from "express";
import {
  createConcern,
  deleteConcern,
  getAllConcerns,
  getConcernByIdOrSlug,
  reorderConcerns,
  updateConcern,
} from "../controllers/concernController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { restrictTo } from "../middleware/restrictTo.js";

const router = Router();

router.route("/").get(getAllConcerns).post(isAuthenticated, restrictTo("admin"), createConcern);
router.patch("/reorder", isAuthenticated, restrictTo("admin"), reorderConcerns);
router.route("/:id").put(isAuthenticated, restrictTo("admin"), updateConcern).delete(isAuthenticated, restrictTo("admin"), deleteConcern);
router.get("/:idOrSlug", getConcernByIdOrSlug);

export const concernRoutes = router;
