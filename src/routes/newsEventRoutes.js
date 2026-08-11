import { Router } from "express";

import { createNewsEvent, deleteNewsEvent, getAllNewsEvent, getNewsEventById, updateNewsEvent } from "../controllers/newsEventController.js";
import { uploadNewsEventFiles } from "../middleware/uploadMulter.js";

const router = Router();

router.route("/").get(getAllNewsEvent).post(uploadNewsEventFiles, createNewsEvent);
router.get("/:id", getNewsEventById);
router.put("/:id", uploadNewsEventFiles, updateNewsEvent);
router.delete("/:id", deleteNewsEvent);

export const newsEventRoutes = router;
