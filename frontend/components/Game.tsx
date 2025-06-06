import DrawAreaSockets from "@/components/DrawAreaSockets";
import GameChat from "@/components/GameChat";
import { useSocketContext } from "@/contexts/SocketContext";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";

type User = {
  username: string;
};

type Player = {
  name: string;
  points: number;
  isDrawing: boolean;
};

export default function Game({ gameId }: { gameId: string }) {
  const router = useRouter();
  const socket = useSocketContext();
  const { user } = useUser() as { user?: User };

  // const [, setJoined] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [turnActive, setTurnActive] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [finalPlayers, setFinalPlayers] = useState<Player[]>([]);

  // round info
  const [roundNum, setRoundNum] = useState(0);
  const [currWord, setCurrWord] = useState(""); // only defined for current drawer
  const [wordLength, setWordLength] = useState(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currDrawer, setCurrDrawer] = useState("");

  const startGame = () => {
    if (!socket) return;
    socket.emit("start_game");
  };

  const endGame = () => {
    if (!socket) return;
    socket.emit("end_game");
  };

  useEffect(() => {
    if (!socket) return;
    socket.emit("join_game", gameId, () => {
      console.log("Connected to game:", gameId);
    });

    socket.on("user_joined", ({ players }) => {
      setPlayers(players);
    });

    socket.on("user_left", ({ players }) => {
      setPlayers(players);
    });

    socket.on("error_message", ({ message }) => {
      alert(message);
      if (
        message === "Game already started. Cannot join." ||
        message === "Game has ended. Cannot join."
      ) {
        router.push("/"); // return to home screen
      }
    });

    socket.on("reveal_info", ({ roundNum, currDrawer, wordLength }) => {
      setGameStarted(true);
      setShowInfo(true);
      setRoundNum(roundNum);
      setCurrDrawer(currDrawer);
      setWordLength(wordLength);
      setTurnActive(false);
    });

    socket.on("reveal_word", ({ word }) => {
      setCurrWord(word);
    });

    socket.on("start_turn", ({ endTime }) => {
      setShowInfo(false);
      setEndTime(endTime);
      setTimeLeft(Math.floor((endTime - Date.now()) / 1000));
      setTurnActive(true);
    });

    socket.on("game_ended", ({ game }) => {
      setGameStarted(false);
      setGameEnded(true);
      setFinalPlayers(game.players);
    });

    return () => {
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("reveal_info");
      socket.off("reveal_word");
      socket.off("start_turn");
      socket.off("game_ended");
    };
  }, [socket, gameId, router]);

  useEffect(() => {
    if (!socket) return;
    if (!gameStarted || endTime === null) return;

    const interval = setInterval(() => {
      if (!endTime) return;
      const remaining = Math.max(endTime - Date.now(), 0);
      setTimeLeft(Math.floor(remaining / 1000));

      if (remaining <= 0 && turnActive) {
        clearInterval(interval);

        const isDrawer = user?.username === currDrawer;

        if (isDrawer) {
          socket.emit("end_turn");
        }
        setCurrWord("");
        setWordLength(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, gameStarted, currDrawer, socket, user?.username, turnActive]);

  return (
    <div className="relative flex flex-col flex-1 items-center p-8 h-[100vh] w-[100vw] gap-4 bg-blue-200 overflow-hidden pt-[var(--navbar-height)]">
      {/* Overlay */}
      {showInfo && (
        <div className="absolute inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 border-black">
          <div className="nes-container is-rounded bg-white p-8 w-100 rounded-xl text-center shadow-lg">
            {user?.username !== currDrawer && (
              <div className="text-xl font-bold">
                {currDrawer} is getting ready to draw...
              </div>
            )}
            {user?.username === currDrawer && (
              <>
                <div className="text-2xl font-bold">You&apos;re up!</div>
                <div className="text-xl mt-2 italic">Your word: {currWord}</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex flex-row items-center w-full justify-center z-10">
        {!gameStarted ? (
          <button className="nes-btn is-success" onClick={startGame}>
            Start Game
          </button>
        ) : (
          <div className="text-center text-lg font-bold">
            Round: {roundNum}
            <div className="nes-text is-error">Time Left {timeLeft}s</div>
            <div className="mt-4">
              {user?.username !== currDrawer && (
                <div className="text-lg mt-1">{"_".repeat(wordLength)}</div>
              )}
              {user?.username === currDrawer && (
                <>
                  <span className="text-sm mt-1">My word: </span>
                  <span className="text-sm nes-text is-primary">
                    {" "}
                    {currWord}
                  </span>
                </>
              )}
            </div>
            <button className="nes-btn mt-2" onClick={endGame}>
              End Game
            </button>
          </div>
        )}
      </div>

      {gameEnded && (
        <div className="absolute inset-0 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 border-black">
          <div className="nes-container is-rounded bg-white p-8 rounded-xl text-center shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Game Over</h2>
            <p className="text-lg mb-4">Final Scores:</p>
            <ul className="space-y-2">
              {finalPlayers
                .sort((a, b) => b.points - a.points)
                .map((player, idx) => (
                  <li key={idx} className="flex justify-between px-4">
                    <span className="nes-text is-primary">{player.name}</span>
                    <span className="nes-text is-error">
                      {player.points} pts
                    </span>
                  </li>
                ))}
            </ul>
            <button className="nes-btn mt-6" onClick={() => router.push("/")}>
              Return to Home
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-row items-center flex-1 pb-8 h-0 max-w-full gap-8 bg-blue-200 justify-center z-0">
        <div className="flex flex-col min-w-3xs nes-container h-full gap-2 text-xs bg-white">
          {players.map((player, index) => (
            <div
              key={index}
              className="flex flex-col justify-start items-start nes-container"
            >
              <div className="nes-text is-primary">{player.name}</div>
              <div className="nes-text is-error">{player.points} points</div>
            </div>
          ))}
        </div>

        <DrawAreaSockets />

        <div className="h-full flex min-w-80">
          <GameChat />
        </div>
      </div>
    </div>
  );
}
