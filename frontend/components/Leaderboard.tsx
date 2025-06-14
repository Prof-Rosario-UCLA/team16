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
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>();
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
    <section className="section-flex max-w-4xl max-h-screen mt-8 flex-col mx-auto px-8 gap-6 overflow-y-auto">
      <h1 className="hidden sm:block nes-text is-primary mb-8 text-center text-2xl md:text-4xl">
        HIGH SCORES
      </h1>
      <section className="section-flex flex flex-col [@media(min-width:400px)]:flex-row justify-center gap-4 mb-4">
        <button
          className={`nes-btn ${sortKey === "wins" ? "is-warning" : ""}`}
          onClick={() => setSortKey("wins")}
          aria-label="Sort by Wins"
        >
          Wins
        </button>
        <button
          className={`nes-btn ${sortKey === "points" ? "is-warning" : ""}`}
          onClick={() => setSortKey("points")}
          aria-label="Sort by Points"
        >
          Points
        </button>
        <button
          className={`nes-btn ${sortKey === "games" ? "is-warning" : ""}`}
          onClick={() => setSortKey("games")}
          aria-label="Sort by Games"
        >
          Games
        </button>
      </section>
      <section className="!px-6 nes-container with-title bg-white" aria-label="Leaderboard">
        <p className="title">LEADERBOARD</p>

        <LeaderboardList
          leaderboardData={leaderboardData}
          sortKey={sortKey}
          username={username}
        />
      </section>
      <section className="!px-6 nes-container with-title bg-white" aria-label="Your Stats">
        <p className="title">YOU</p>
        {userStats && username && (
          <LeaderboardEntryCard
            username={username}
            stats={userStats}
            label={`#${userStats.placement[sortKey]}`}
            highlight
          />
        )}
      </section>
      {leaderboardData && (
        <section className="text-center text-gray-500 text-sm">
          <span className="hidden [@media(min-width:400px)]:block" aria-label="Next refresh time">
            Next refresh at:
            {new Date(leaderboardData.expires).toLocaleTimeString()}
          </span>
        </section>
      )}
    </section>
  );
};

const LeaderboardList = ({
  leaderboardData,
  sortKey,
  username,
}: {
  leaderboardData: LeaderboardResponse | undefined | null;
  sortKey: "wins" | "points" | "games";
  username: string | undefined;
}) => {
  let rank = 1;
  let prevStat = 0; // initial val doesn't matter
  let displayRank = 1;
  return (
    <div className="flex flex-col flex-grow overflow-y-auto max-h-[40vh] h-[calc(100vh-500px)] min-h-0">
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
<div className="flex flex-col md:flex-row justify-between items-start border-b border-gray-300 last:border-b-0 p-2 gap-2 md:gap-4 w-full">
  <div className="flex md:flex-nowrap items-center gap-4 min-w-0">
    <span className="nes-text text-yellow-600 w-8 shrink-0">{label}</span>
    <span
      className={`nes-text break-words ${highlight ? "is-primary" : "text-gray-900"}`}
    >
      &nbsp;{username}
    </span>
  </div>

  <div className="flex flex-wrap justify-start md:justify-end gap-4 text-sm">
    <div>
      <span className="nes-text text-green-600">{stats.wins}</span>
      <span className="text-gray-500"> WINS</span>
    </div>
    <div>
      <span className="nes-text text-green-600">{stats.points}</span>
      <span className="text-gray-500"> POINTS</span>
    </div>
    <div>
      <span className="nes-text text-green-600">{stats.games}</span>
      <span className="text-gray-500"> GAMES</span>
    </div>
  </div>
</div>

  );
};

export default Leaderboard;
