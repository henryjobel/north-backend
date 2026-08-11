import { Router } from "express";
import {
  createPartners,
  deletePartners,
  getAllPartners,
  updatePartners
} from "../controllers/partnersController.js";

import { uploadPartners } from "../middleware/uploadMulter.js";


const router = Router();

router.route("/").get(getAllPartners).post(uploadPartners, createPartners);
router.put("/:id", uploadPartners, updatePartners);
router.delete("/:id", deletePartners);

export const partnersRoutes = router;
