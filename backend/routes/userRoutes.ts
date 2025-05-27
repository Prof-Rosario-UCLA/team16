import { Router } from "express";
import * as userController from "../controllers/userController";

const router = Router();

router.get("/me", userController.getCurrentUser);

export default router;
