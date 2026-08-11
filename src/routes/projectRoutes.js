import { Router } from "express";
import {
  createProject,
  deleteProject,
  downloadBrochure,
  getAllProjects,
  getProjectById,
  getUploadSignature,
  updateProject,
} from "../controllers/projectController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { uploadProjectFiles } from "../middleware/uploadMulter.js";

const router = Router();

router.get("/upload-signature", isAuthenticated, getUploadSignature);
router.route("/").get(getAllProjects).post(uploadProjectFiles, createProject);
router.get("/:id/brochure", downloadBrochure);
router
  .route("/:id")
  .get(getProjectById)
  .put( uploadProjectFiles, updateProject)
  .delete( deleteProject);

export const projectRoutes = router;
