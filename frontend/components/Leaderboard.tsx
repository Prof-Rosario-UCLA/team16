"use client";

import { useUser } from "@/contexts/UserContext";
import { getLeaderboard, getUserStats } from "@/utils/api";
import {
  LeaderboardEntry,
  LeaderboardResponse,
  UserStatsResponse,
} from "@/utils/types";
import { useEffect, useState } from "react";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse>();
  const [sortKey, setSortKey] = useState<"wins" | "points" | "games">("wins");
  const [userStats, setUserStats] = useState<UserStatsResponse | null>(null);

  const userContext = useUser();
  const username = userContext?.user?.username;

  useEffect(() => {
    const fetchData = async () => {
      const data = await getLeaderboard();
      setLeaderboardData(data);
    };
    fetchData();
  }, [sortKey]);

  useEffect(() => {
    if (!username) return;
    const fetchData = async () => {
      const data = await getUserStats(username);
      setUserStats(data);
    };
    fetchData();
  }, [username]);

  return (
    <div className="max-w-4xl mt-16 flex flex-col mx-auto px-8 gap-4">
      <h1 className="nes-text is-primary mb-8 text-center text-2xl md:text-4xl">
        HIGH SCORES
      </h1>
      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`nes-btn ${sortKey === "wins" ? "is-warning" : ""}`}
          onClick={() => setSortKey("wins")}
        >
          Wins
        </button>
        <button
          className={`nes-btn ${sortKey === "points" ? "is-warning" : ""}`}
          onClick={() => setSortKey("points")}
        >
          Points
        </button>
        <button
          className={`nes-btn ${sortKey === "games" ? "is-warning" : ""}`}
          onClick={() => setSortKey("games")}
        >
          Games
        </button>
      </div>
      <div className="!px-6 nes-container with-title bg-white">
        <p className="title">LEADERBOARD</p>

        <LeaderboardList
          leaderboardData={leaderboardData}
          sortKey={sortKey}
          username={username}
        />
      </div>
      <div className="!px-6 nes-container with-title bg-white">
        <p className="title">YOU</p>
        {userStats && username && (
          <LeaderboardEntryCard
            username={username}
            stats={userStats}
            label={`#${userStats.placement[sortKey]}`}
            highlight
          />
        )}
      </div>
      {leaderboardData && (
        <div className="text-center text-gray-500 text-sm mt-4">
          <span>
            Next refresh at:
            {new Date(leaderboardData.expires).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
};

const LeaderboardList = ({
  leaderboardData,
  sortKey,
  username,
}: {
  leaderboardData: LeaderboardResponse | undefined;
  sortKey: "wins" | "points" | "games";
  username: string | undefined;
}) => {
  let rank = 1;
  let prevStat = 0; // initial val doesn't matter
  let displayRank = 1;
  return (
    <div className="flex flex-col">
      {leaderboardData?.value?.[sortKey]?.map((data) => {
        const currentStat = data.stats[sortKey];
        if (currentStat !== prevStat) {
          // logic for showing ties
          displayRank = rank;
        }
        prevStat = currentStat;
        rank++;

        return (
          <LeaderboardEntryCard
            key={data.username}
            username={data.username}
            stats={data.stats}
            label={`#${displayRank}`}
            highlight={data.username === username}
          />
        );
      })}
    </div>
  );
};

const LeaderboardEntryCard = ({
  username,
  stats,
  label,
  highlight = false,
}: {
  username: string;
  stats: LeaderboardEntry["stats"];
  label: string;
  highlight?: boolean;
}) => {
  return (
    <div className="flex justify-between items-start border-b border-gray-300 last:border-b-0 flex-col md:flex-row p-2">
      <div className="flex items-center gap-8">
        <span className="nes-text text-yellow-600 w-8 ">{label}</span>
        <span
          className={`nes-text ${highlight ? "is-primary" : "text-gray-900"}`}
        >
          {username}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <span className="nes-text text-green-600">{stats.wins}</span>
          <span className="text-gray-500 text-sm"> WINS</span>
        </div>
        <div>
          <span className="nes-text text-green-600">{stats.points}</span>
          <span className="text-gray-500 text-sm"> POINTS</span>
        </div>
        <div>
          <span className="nes-text text-green-600">{stats.games}</span>
          <span className="text-gray-500 text-sm"> GAMES</span>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
