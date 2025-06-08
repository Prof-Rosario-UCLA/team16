"use client";

import { useUser } from "@/contexts/UserContext";
import { createGame } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useUser() ?? {};

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // user not logged in
    }
  }, [user, loading, router]);

  const handleCreateGame = async () => {
    const res = await createGame();
    const gameId = res.data.id;
    router.push(`/game/${gameId}`);
  };


  if (loading)
    return (
      <div className="flex items-center justify-center w-full h-screen">
        Loading...
      </div>
    );

  if (!user) return null; // Or a placeholder until redirect

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
