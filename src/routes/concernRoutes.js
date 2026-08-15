import { Router } from "express";
import {
  createConcern,
  deleteConcern,
  getAllConcerns,
  getConcernByIdOrSlug,
  reorderConcerns,
  updateConcern,
} from "../controllers/concernController.js";

const router = Router();

router.route("/").get(getAllConcerns).post(createConcern);
router.patch("/reorder", reorderConcerns);
router.route("/:id").put(updateConcern).delete(deleteConcern);
router.get("/:idOrSlug", getConcernByIdOrSlug);

export const concernRoutes = router;
