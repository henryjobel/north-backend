import { Router } from "express";
import { getAboutContent, updateAboutContent } from "../controllers/aboutContentController.js";

const router = Router();

router.route("/").get(getAboutContent).put(updateAboutContent);

export const aboutContentRoutes = router;
