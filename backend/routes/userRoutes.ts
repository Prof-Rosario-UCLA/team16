import { Router } from "express";
import * as userController from "../controllers/userController";

const router = Router();

router.post("/", userController.registerUser);
router.post("/session", userController.loginUser);

export default router;
