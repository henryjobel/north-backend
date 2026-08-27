import { Router } from "express";
import {
  getConcernMenuItems,
  reorderConcernMenuItems,
  addCustomMenuItem,
  deleteCustomMenuItem,
} from "../controllers/menuController.js";

const router = Router();

router.route("/concerns").get(getConcernMenuItems).patch(reorderConcernMenuItems);
router.route("/custom").post(addCustomMenuItem);
router.route("/custom/:id").delete(deleteCustomMenuItem);

export const menuRoutes = router;
