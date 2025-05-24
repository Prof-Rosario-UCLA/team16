"use client";

import axios from "axios";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const handleCreateGame = async () => {
    const res = await axios.post("http://localhost:3001/api/game");
    const gameId = res.data.id;
    router.push(`/game/${gameId}`);
  };
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <button
        type="button"
        className="px-4 py-2 text-white bg-blue-500 rounded"
        onClick={handleCreateGame}
      >
        Create Game
      </button>
    </div>
  );
}
