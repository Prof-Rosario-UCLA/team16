import { Router } from "express";
import * as userController from "../controllers/userController";

const router = Router();

router.get("/me", userController.getCurrentUser);
router.get("/:username/stats", userController.getStats);

export default router;
