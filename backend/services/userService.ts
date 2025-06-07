import { User } from "../models/userModel";

export const updateUserStats = async (
  username: string,
  stats: { games: number; points: number; wins: number }
) => {
  const { games, points, wins } = stats;
  await User.updateOne(
    { username: username },
    {
      $inc: {
        "stats.games": games,
        "stats.points": points,
        "stats.wins": wins,
      },
    }
  );
};

export const getTopUsers = async (
  sortKey: string = "wins",
  limit: number = 10
) => {
  const validKeys = ["wins", "games", "points"];
  if (!validKeys.includes(sortKey)) {
    throw new Error("Invalid sort key");
  }
  return await User.find()
    .sort({
      [`stats.${sortKey}`]: -1,
      "stats.wins": -1,
      "stats.points": -1,
      "stats.games": -1,
      username: 1,
    })
    .limit(limit)
    .select("username stats");
};

export const getUserStats = async (username: string) => {
  // get user's stats
  const user = await User.findOne({ username });
  if (!user || !user.stats) {
    throw new Error("User not found");
  }

  // calculate placement for specified stat
  const winsRank =
    (await User.countDocuments({
      ["stats.wins"]: { $gt: user.stats.wins },
    })) + 1;
  const pointsRank =
    (await User.countDocuments({
      ["stats.points"]: { $gt: user.stats.points },
    })) + 1;
  const gamesRank =
    (await User.countDocuments({
      ["stats.games"]: { $gt: user.stats.games },
    })) + 1;

  return {
    wins: user.stats.wins,
    points: user.stats.points,
    games: user.stats.games,
    placement: {
      wins: winsRank,
      points: pointsRank,
      games: gamesRank,
    },
  };
};
