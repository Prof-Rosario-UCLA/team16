"use client";

import { useUser } from "@/contexts/UserContext";
import { createGame } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useUser() ?? {};
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // user not logged in
    }
  }, [user, loading, router]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      console.log('Network came back online');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log('Network went offline');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCreateGame = async () => {
    if (!isOnline) {
      console.log('Cannot create game while offline');
      return;
    }
    
    const res = await createGame();
    if (!res) {
      console.error("Failed to create game");
      return;
    }
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
    <div className="flex flex-col items-center justify-center w-full h-screen gap-4">
      {isOnline ? (
        <>
          <h1 className="text-2xl font-bold">Welcome, {user.username}!</h1>
          <button
            type="button"
            className="nes-btn is-primary"
            onClick={handleCreateGame}
          >
            Create Game
          </button>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold">You are offline</h1>
            <p className="text-lg">Please check your internet connection.</p>
          </div>
          <button
            type="button"
            className="nes-btn is-disabled"
            disabled
          >
            Create Game (Offline)
          </button>
        </>
      )}
    </div>
  );
}