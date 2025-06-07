import asyncHandler from "express-async-handler";
import { User } from "../models/userModel";
import { memoryCache } from "../utils/cacheMiddleware";

export const fetchLeaderboard = asyncHandler(async (req: any, res: any) => {
  const leaderboard = await memoryCache.wrap(
    "leaderboard",
    async () => {
      return await User.find()
        .sort({ "stats.wins": -1 })
        .limit(10)
        .select("username stats");
    },
    { raw: true, ttl: 3 * 60 * 1000 } // Cache for 3 minutes
  );
  res.status(200).json(leaderboard);
});
