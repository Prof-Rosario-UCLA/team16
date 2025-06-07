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
