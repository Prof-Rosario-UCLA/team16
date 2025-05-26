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
        className="nes-btn is-primary"
        onClick={handleCreateGame}
      >
        Create Game
      </button>
    </div>
  );
}
