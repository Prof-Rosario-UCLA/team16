import DrawArea, { DrawAreaRef } from "@/components/DrawArea";
import GameChat from "@/components/GameChat";
import { useSocketContext } from "@/contexts/SocketContext";
import { useEffect, useRef, useState } from "react";

type Player = {
  name: string;
  points: number;
  isDrawing: boolean;
};

const dummyPlayers: Player[] = [
  { name: "Player 1", points: 10, isDrawing: false },
  { name: "Player 2", points: 20, isDrawing: true },
  { name: "Player 3", points: 15, isDrawing: false },
];

export default function Game({ gameId }: { gameId: string }) {
  const socket = useSocketContext();
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState<Player[]>(dummyPlayers);

  useEffect(() => {
    if (!socket) return;
    socket.emit("join_game", gameId, () => {
      setJoined(true);
      console.log("Connected to game:", gameId);
    });
  }, [socket, gameId]);

  return (
    <div className="flex flex-row items-center flex-1 p-24 h-[100vh] w-[100vw] gap-8 bg-blue-200 justify-center">
      <div className="flex flex-col min-w-3xs nes-container h-full gap-2 text-xs bg-white">
        {players.map((player, index) => (
          <div
            key={index}
            className={`flex flex-col justify-start items-start nes-container`}
          >
            <div className="nes-text is-primary">{player.name}</div>
            <div className="nes-text is-error ">{player.points} points</div>
          </div>
        ))}
      </div>
      {/* <div className="flex-[3] w-full h-full gap-4 flex flex-col bg-amber-300 justify-between"> */}
      {/* <button
          className="px-4 py-2 nes-btn is-primary"
          onClick={ref.current?.exportDrawing}
          >
          Export Drawing
          </button> */}

      <DrawArea />

      <div className="h-full flex min-w-80">
        <GameChat />
      </div>
    </div>
  );
}
