"use client";

import Game from "@/components/Game";
import { SocketProvider } from "@/contexts/SocketContext";
import { useUser } from "@/contexts/UserContext";
import { redirect, useParams } from "next/navigation";

export default function RoomPage() {
  const { gameId } = useParams();
  const { user, loading } = useUser() ?? {};

  if (loading) {
    return <div className="flex items-center justify-center w-full h-screen">Loading...</div>;
  }
  if (!user) {
    // if not logged in, redirect to login
    redirect(`/login?redirect=/game/${gameId}`);
  }

  return (
    <SocketProvider>
      <Game gameId={gameId as string} />
    </SocketProvider>
  );
}
