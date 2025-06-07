export type LeaderboardEntry = {
  username: string;
  stats: {
    gamesPlayed: number;
    totalPoints: number;
    wins: number;
  };
};

export type LeaderboardResponse = {
  value: LeaderboardEntry[];
  expires: number;
};
