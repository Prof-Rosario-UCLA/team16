import { Router } from "express";
import * as gameController from "../controllers/gameController";

const router = Router();

router.post("/", gameController.generateGame);

export default router;
