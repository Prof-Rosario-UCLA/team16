"use client";

import { getLeaderboard } from "@/utils/api";
import { LeaderboardEntry } from "@/utils/types";
import { useEffect, useState } from "react";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [expires, setExpires] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getLeaderboard();
      setLeaderboardData(data.value);
      setExpires(data.expires);
    };
    fetchData();
  }, []);
  console.log("Leaderboard Data:", leaderboardData);

  return (
    <div className="max-w-3xl mt-16 flex flex-col mx-auto px-8 gap-4">
      <h1 className="nes-text is-primary mb-8 text-center text-2xl md:text-4xl">
        HIGH SCORES
      </h1>

      <div className="!px-6 nes-container with-title bg-white">
        <p className="title">LEADERBOARD</p>

        <div className="flex flex-col">
          {leaderboardData.map((data, index) => (
            <LeaderboardEntryCard
              key={index}
              username={data.username}
              wins={data.stats.wins}
              label={`#${index + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="text-center text-gray-500 text-sm mt-4">
        <span>Next refresh at: {new Date(expires).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

const LeaderboardEntryCard = ({
  username,
  wins,
  label,
}: {
  username: string;
  wins: number;
  label: string;
}) => {
  return (
    <div className="flex justify-between items-start border-b border-gray-300 last:border-b-0 flex-col sm:flex-row p-4">
      <div className="flex items-center gap-8">
        <span className="nes-text text-yellow-600 w-8 ">{label}</span>
        <span className="nes-text text-gray-800">{username}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="nes-text text-green-600">{wins}</span>
        <span className="text-gray-500 text-sm">WINS</span>
      </div>
    </div>
  );
};

export default Leaderboard;
