"use client";

import Game from "@/components/Game";
import { SocketProvider } from "@/contexts/SocketContext";
import { useUser } from "@/contexts/UserContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function RoomPage() {
  const { gameId } = useParams();
  const router = useRouter();
  const { user, loading } = useUser() ?? {};

  useEffect(() => {
    if (!loading && !user) {
      // if not logged in, redirect to login
      router.replace(`/login?redirect=/game/${gameId}`);
    }
  }, [user, loading, router, gameId]);

  if (loading) {
    return <div className="flex items-center justify-center w-full h-screen">Loading...</div>;
  }

  return (
    <SocketProvider>
      <Game gameId={gameId as string} />
    </SocketProvider>
  );
}
