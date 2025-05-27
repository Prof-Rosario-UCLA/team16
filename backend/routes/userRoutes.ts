import { Router } from "express";
import * as userController from "../controllers/userController";

const router = Router();

router.post("/", userController.registerUser);
router.post("/session", userController.loginUser);
router.delete("/session", userController.logoutUser);

export default router;
