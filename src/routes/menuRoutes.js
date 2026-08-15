import { Router } from "express";
import {
  getConcernMenuItems,
  reorderConcernMenuItems,
} from "../controllers/menuController.js";

const router = Router();

router.route("/concerns").get(getConcernMenuItems).patch(reorderConcernMenuItems);

export const menuRoutes = router;
