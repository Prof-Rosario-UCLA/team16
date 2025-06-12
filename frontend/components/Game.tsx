import DrawAreaSockets from "@/components/DrawAreaSockets";
import GameChat from "@/components/GameChat";
import { useSocketContext } from "@/contexts/SocketContext";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import playSound from "@/utils/playSound";
import GameBar from "@/components/GameBar";
import GameLeaderboard from "@/components/GameLeaderboard";

type User = {
  username: string;
};

export type Player = {
  name: string;
  points: number;
  isDrawing: boolean;
};

export default function Game({ gameId }: { gameId: string }) {
  const router = useRouter();
  const socket = useSocketContext();
  const { user } = useUser() as { user?: User };

  const username = user?.username;

  // const [, setJoined] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [turnStarting, setTurnStarting] = useState(false); // turn starting screen (revealing the drawer)
  const [turnEnding, setTurnEnding] = useState(false); // turn end screen (revealing the updated points)
  const [turnActive, setTurnActive] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [finalPlayers, setFinalPlayers] = useState<Player[]>([]);

  // round info
  const [roundNum, setRoundNum] = useState(0);
  const [currWord, setCurrWord] = useState(""); // only defined for current drawer
  // const [wordLength, setWordLength] = useState(0);
  const [maskedWord, setMaskedWord] = useState("______");
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currDrawer, setCurrDrawer] = useState("");
  const [pointDifferences, setPointDifferences] = useState<
    Record<string, number>
  >({});
  const [drawerScore, setDrawerScore] = useState(0);
  const [isGuessing, setIsGuessing] = useState(true);

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
      // playSound("join");
    });

    socket.on("user_joined", ({ players }) => {
      setPlayers(players);
      // playSound("join");
    });

    socket.on("user_left", ({ players }) => {
      setPlayers(players);
    });

    socket.on(
      "correct_guess",
      ({ user: guesser, currWord, pointChange, players, activeGuessers }) => {
        setPlayers(players);
        // track difference in points
        setPointDifferences((prevDiffs) => ({
          ...prevDiffs,
          [guesser]: pointChange,
        }));

        if (guesser === user?.username) {
          setIsGuessing(false);
          setCurrWord(currWord);
        }

        // end the turn once everyone (besides drawer) has guessed correctly
        const allGuessed = Object.values(activeGuessers).every(
          (val) => val === false
        );
        const isGuesser = user?.username === guesser;
        if (allGuessed && isGuesser) {
          socket.emit("end_turn"); // only send end_turn once (last guesser sends it)
        }
      }
    );

    socket.on("error_message", ({ message, redirectUrl }) => {
      alert(message);
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    });

    socket.on("reveal_drawer", ({ roundNum, currDrawer, maskedWord }) => {
      setGameStarted(true);
      setTurnEnding(false);
      setCurrWord(""); // clear out current word at the start of this round

      // reset point differences
      setPointDifferences({});

      setTurnStarting(true); // show the turn starting screen
      setRoundNum(roundNum);
      setCurrDrawer(currDrawer);
      setMaskedWord(maskedWord);
      setTurnActive(false);
      setIsGuessing(true);
      setCurrWord("");
      playSound("newround");
    });

    // show updated points and the correct word after drawing time is up
    socket.on(
      "reveal_updated_points",
      ({ new_players, word, drawer_score }) => {
        setDrawerScore(drawer_score);
        setTurnEnding(true);
        setPlayers(new_players);
        setCurrWord(word);
      }
    );

    socket.on("reveal_word_private", ({ word }) => {
      setCurrWord(word);
    });

    socket.on("start_turn", ({ endTime }) => {
      setTurnStarting(false);
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
      socket.off("correct_guess");
      socket.off("error_message");
      socket.off("reveal_drawer");
      socket.off("reveal_updated_points");
      socket.off("reveal_word_private");
      socket.off("start_turn");
      socket.off("game_ended");
    };
  }, [socket, gameId, router, user?.username]);

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
          socket.emit("end_turn", { time: Date.now() }); // only want to emit end_turn once (only the drawer emits)
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, gameStarted, currDrawer, socket, user?.username, turnActive]);

  return (
    <div className="relative flex flex-col flex-1 items-center h-screen w-screen bg-blue-100 overflow-hidden pt-[var(--navbar-height)]">
      {/* Overlay */}
      {turnStarting && (
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
      {turnEnding && (
        <div className="absolute inset-0 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 border-black">
          <div className="nes-container is-rounded bg-white p-8 rounded-xl text-center shadow-lg max-w-lg w-full">
            <div className="mb-5">
              <h1 className="text-lg nes-text">The word was... </h1>
              <p className="text-lg nes-text is-success uppercase">
                {currWord}
              </p>
            </div>
            <ul className="space-y-2">
              {players
                .sort((a, b) => b.points - a.points)
                .map((player, idx) => {
                  let diff = pointDifferences[player.name] ?? 0;
                  if (player.name === currDrawer) {
                    diff = drawerScore;
                  }
                  return (
                    <li
                      key={idx}
                      className="flex justify-between px-4 items-center"
                    >
                      <span>
                        <span className="mr-2">{idx + 1}.</span>
                        <span className="nes-text is-primary">
                          {player.name}
                        </span>
                        <span className="nes-text is-success"> +{diff}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="nes-text is-error">
                          {player.points} pts
                        </span>
                      </span>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      )}

      {/* Top bar */}
      <GameBar
        gameStarted={gameStarted}
        players={players}
        startGame={startGame}
        endGame={endGame}
        roundNum={roundNum}
        timeLeft={timeLeft}
        isGuessing={isGuessing}
        currWord={currWord}
        maskedWord={maskedWord}
        isCurrDrawer={user?.username === currDrawer}
        gameId={gameId}
      />

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
                    <span>
                      <span className="mr-2">{idx + 1}.</span>
                      <span className="nes-text is-primary">{player.name}</span>
                    </span>
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
      <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full flex-1 h-0 lg:flex lg:justify-between p-4">
        <div className="lg:order-1 order-2 flex-1 ">
          <GameLeaderboard players={players} currDrawer={currDrawer} />
        </div>
        <div className="lg:order-2 order-1 col-span-2 flex-4">
          <DrawAreaSockets user={username} gameStarted={gameStarted} />
        </div>
        <div className="order-3 h-full flex-1">
          <GameChat />
        </div>
      </div>
    </div>
  );
}
