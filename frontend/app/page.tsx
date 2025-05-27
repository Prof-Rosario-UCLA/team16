"use client";

import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const userContext = useUser();
  const user = userContext?.user;
  const loading = userContext?.loading;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // user not logged in
    }
  }, [user, loading, router]);

  const handleCreateGame = async () => {
    const res = await axios.post("http://localhost:3001/api/game", {}, { withCredentials: true });
    const gameId = res.data.id;
    router.push(`/game/${gameId}`);
  };

  if (loading) return <div>Loading...</div>;

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
