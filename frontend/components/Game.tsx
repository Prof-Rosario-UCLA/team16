import DrawArea, { DrawAreaRef } from "@/components/DrawArea";
import GameChat from "@/components/GameChat";
import { useSocketContext } from "@/contexts/SocketContext";
import { useEffect, useRef, useState } from "react";

export default function Game({ gameId }: { gameId: string }) {
  const socket = useSocketContext();
  const [joined, setJoined] = useState(false);
  const ref = useRef<DrawAreaRef>(null);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join_game", gameId, () => {
      setJoined(true);
      console.log("Connected to game:", gameId);
    });
  }, [socket, gameId]);

  return (
    <div className="flex flex-row items-center justify-center w-full h-screen px-32 py-32">
      <div className="w-full h-full flex flex-col">
        <DrawArea ref={ref} />
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={ref.current?.exportDrawing}
        >
          Export Drawing
        </button>
      </div>
      <div className="flex flex-col items-center justify-center">
        <GameChat />
        <div className="mt-4">
          Connection Status:{" "}
          {joined ? "Successfully joined!" : "Joining game..."}
        </div>
      </div>
    </div>
  );
}
