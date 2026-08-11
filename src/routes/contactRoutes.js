import { Router } from "express";
import { createContact, deleteContact, getAllContact, getContactById, updateContact } from "../controllers/contactController.js";
import { parseFormData } from "../middleware/uploadMulter.js";

const router = Router();

router.route("/").get(getAllContact).post(parseFormData,createContact);
router.get("/:id", getContactById);
router.put("/:id", parseFormData,updateContact);
router.delete("/:id", deleteContact);

export const contactRoutes = router;
