export type LeaderboardEntry = {
  username: string;
  stats: {
    games: number;
    points: number;
    wins: number;
  };
};

export type LeaderboardResponse = {
  value: {
    wins: LeaderboardEntry[];
    games: LeaderboardEntry[];
    points: LeaderboardEntry[];
  };
  expires: number;
};

export type UserStatsResponse = {
  wins: number;
  points: number;
  games: number;
  placement: {
    wins: number;
    points: number;
    games: number;
  };
};

export type User = {
  username: string;
};
