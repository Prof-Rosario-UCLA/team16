import GameChat from "@/components/GameChat";
import { useSocketContext } from "@/contexts/SocketContext";
import { useEffect, useState } from "react";

export default function Game({ gameId }: { gameId: string }) {
  const socket = useSocketContext();
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join_game", gameId, () => {
      setJoined(true);
      console.log("Connected to game:", gameId);
    });
  }, [socket, gameId]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <GameChat />
      <div className="mt-4">
        Connection Status: {joined ? "Successfully joined!" : "Joining game..."}
      </div>
    </div>
  );
}
