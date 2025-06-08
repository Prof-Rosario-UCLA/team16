import asyncHandler from "express-async-handler";
import { User } from "../models/userModel";
import { memoryCache } from "../utils/cacheMiddleware";
import { getTopUsers } from "../services/userService";

export const fetchLeaderboard = asyncHandler(async (req: any, res: any) => {
  console.log("Fetching leaderboard");

  const cacheKey = `leaderboard`;
  const leaderboard = await memoryCache.wrap(cacheKey, getAllLeaderboards, {
    raw: true,
    ttl: 180000,
  });

  res.status(200).json(leaderboard);
});

const getAllLeaderboards = async () => {
  const [wins, games, points] = await Promise.all([
    getTopUsers("wins"),
    getTopUsers("games"),
    getTopUsers("points"),
  ]);

  return { wins, games, points };
};
