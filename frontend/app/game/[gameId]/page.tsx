"use client";

import Game from "@/components/Game";
import { SocketProvider } from "@/contexts/SocketContext";
import { useParams } from "next/navigation";

export default function RoomPage() {
  const { gameId } = useParams();
  return (
    <SocketProvider>
      <Game gameId={gameId as string} />
    </SocketProvider>
  );
}
