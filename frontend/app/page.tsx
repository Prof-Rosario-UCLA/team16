"use client";

import { useUser } from "@/contexts/UserContext";
import { createGame, ping } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useUser() ?? {};
  const [isOnline, setIsOnline] = useState(true);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // user not logged in
    }
  }, [user, loading, router]);

  useEffect(() => {
    const checkOnlineStatus = async () => {
      const pingCheck = await ping();
      setIsOnline(pingCheck);
    };
    
    checkOnlineStatus();
    const interval = setInterval(checkOnlineStatus, 3000); // check connection every 3 seconds

    const handleOnline = () => {
      console.log('Network came back online');
      checkOnlineStatus();
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
      clearInterval(interval);
    };
  }, []);

  const handleCreateGame = async () => {
    const pingCheck = await ping();
    if (!isOnline || !pingCheck) {
      setIsOnline(false);
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

  const handleJoinGame = () => {
    if (!code.trim()) return;
    const gameCode = code.trim();
    // ensure game code is an actual game

    router.push(`/game/${gameCode}`);
  };

  if (loading || !user)
    return (
      <div className="flex items-center justify-center w-full h-screen">
        Loading...
      </div>
    );

  return (
    <main className="main-flex items-center justify-center w-full h-screen gap-4">
      {isOnline ? (
        <section className="section-flex flex-col items-center justify-center w-full h-full gap-4">
          <header>
            <h1 className="text-2xl font-bold px-4 text-center">
              Welcome, {user.username}!
            </h1>
          </header>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleJoinGame();
            }}
            className="flex flex-col sm:flex-row items-center gap-2 px-4"
            aria-label="Join existing game"
          >
            <input
              type="text"
              className="nes-input"
              placeholder="Enter game code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              aria-label="Game code input"
            />
            <button
              type="submit"
              className="nes-btn is-success"
              aria-label="Join game"
            >
              Join
            </button>
          </form>

          <button
            type="button"
            className="nes-btn is-primary"
            onClick={handleCreateGame}
            aria-label="Create game"
          >
            Create Game
          </button>
        </section>
      ) : (
        <section className="section-flex flex flex-col items-center gap-4">
          <header className="px-4 text-center">
            <h1 className="text-2xl font-bold">You are offline</h1>
            <p className="text-lg">Please check your internet connection.</p>
          </header>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleJoinGame();
            }}
            className="flex flex-col items-center gap-2 px-4"
            aria-label="Join game (disabled)"
          >
            <input
              type="text"
              className="nes-input w-200"
              placeholder="Enter game code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              aria-label="Game code input"
              disabled
            />
          </form>

          <button type="button" className="nes-btn is-disabled" disabled>
            Create Game
          </button>
        </section>
      )}
    </main>
  );
}