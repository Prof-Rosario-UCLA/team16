import { Router } from "express";
import * as loginController from "../controllers/loginController";
import { verifyToken } from "../utils/auth.js";

const router = Router();

router.post("/", loginController.registerUser);
router.post("/session", loginController.loginUser);
router.delete("/session", loginController.logoutUser);

export default router;
