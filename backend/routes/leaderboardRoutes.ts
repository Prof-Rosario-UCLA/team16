import { Router } from "express";
import * as leaderboardController from "../controllers/leaderboardController";

const router = Router();

router.get("/", leaderboardController.fetchLeaderboard);

export default router;
