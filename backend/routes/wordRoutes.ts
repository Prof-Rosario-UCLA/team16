import { Router } from "express";
import * as wordController from "../controllers/wordController";

const router = Router();

router.get("/randomWord", wordController.getRandomWord);

export default router;
