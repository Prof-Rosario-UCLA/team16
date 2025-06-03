import DrawAreaSockets from "@/components/DrawAreaSockets";
import GameChat from "@/components/GameChat";
import { useSocketContext } from "@/contexts/SocketContext";
import { useEffect, useState } from "react";

type Player = {
  name: string;
  points: number;
  isDrawing: boolean;
};

// const dummyPlayers: Player[] = [
//   { name: "Player 1", points: 10, isDrawing: false },
//   { name: "Player 2", points: 20, isDrawing: true },
//   { name: "Player 3", points: 15, isDrawing: false },
// ];

export default function Game({ gameId }: { gameId: string }) {
  const socket = useSocketContext();
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = () => {
    if (!socket) return;
    socket.emit("start_game");
  }

  const endGame = () => {
    if (!socket) return;
    socket.emit("end_game");
  }

  useEffect(() => {
    if (!socket) return;
    socket.emit("join_game", gameId, () => {
      setJoined(true);
      console.log("Connected to game:", gameId);
    });

    socket.on("user_joined", ({ game }) => {
      setPlayers(game.players);
    });

    socket.on("user_left", ({ game }) => {
      setPlayers(game.players);
    });
  
    socket.on("game_started", () => {
      setGameStarted(true);
    });

    socket.on("game_ended", () => {
      setGameStarted(false);
    })

    return () => {
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("game_started");
      socket.off("game_ended");
    };
  }, [socket, gameId]);

  return (
    <div className="flex flex-col flex-1 items-center p-8 h-[100vh] w-[100vw] bg-blue-200 gap-2">
      <div className="flex flex-row items-center w-full justify-center">
        {!gameStarted && (
          <div className="z-50">
          <button className="nes-btn is-success" onClick={startGame}>
            Start Game
          </button>
        </div>
        )}
        {gameStarted && (
          <div className="z-50">
          <button className="nes-btn" onClick={endGame}>
            End Game
          </button>
        </div>
        )}
      </div>

      <div className="flex flex-row items-center flex-1 p-10 pt-2 h-[100vh] w-[100vw] gap-8 bg-blue-200 justify-center">
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

        <DrawAreaSockets />

        <div className="h-full flex min-w-80">
          <GameChat />
        </div>
      </div>
    </div>
  );
}
