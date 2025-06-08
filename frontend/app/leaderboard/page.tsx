import Leaderboard from "@/components/Leaderboard";

const LeaderboardPage = () => {
  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-100 pt-[var(--navbar-height)]">
      <Leaderboard />
    </div>
  );
};

export default LeaderboardPage;
