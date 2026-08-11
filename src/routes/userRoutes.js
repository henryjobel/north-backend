import { Router } from "express";
import { allUsers, loadUser, loginUser, logout, registerUser, updateProfile } from "../controllers/userController.js";
import { isLoggedIn } from "../middleware/restrictTo.js";
import { uploadProfilePic } from "../middleware/uploadMulter.js";

const router = Router();

router.post("/registration",uploadProfilePic, registerUser);
router.post('/login',loginUser);
router.get('/logout',logout);
router.get('/me',isLoggedIn,loadUser);
router.get('/all',allUsers);
router.put('/update-profile', isLoggedIn, uploadProfilePic, updateProfile);


export const userRouters = router;
