import asyncHandler from "express-async-handler";
import { User } from "../models/userModel";
import { memoryCache } from "../utils/cacheMiddleware";
import { getTopUsers } from "../services/userService";

export const fetchLeaderboard = asyncHandler(async (req: any, res: any) => {
  const sortKey = req.query.sort || "wins";
  console.log("Fetching leaderboard with sort key:", sortKey);
  const validKeys = ["wins", "games", "points"];
  if (!validKeys.includes(sortKey))
    return res.status(400).json({ error: "invalid sort key" });

  const cacheKey = `leaderboard:${sortKey}`;
  const leaderboard = await memoryCache.wrap(
    cacheKey,
    () => getTopUsers(sortKey),
    { raw: true, ttl: 180000 }
  );

  res.status(200).json(leaderboard);
});
