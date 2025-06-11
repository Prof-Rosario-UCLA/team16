import DrawAreaSockets from "@/components/DrawAreaSockets";
import GameChat from "@/components/GameChat";
import { useSocketContext } from "@/contexts/SocketContext";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import playSound from "@/utils/playSound";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";

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
  const [maskedWord, setMaskedWord] = useState("");
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
      // setWordLength(wordLength);
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
    <main className="main-flex relative flex-col flex-1 items-center p-8 h-[100vh] w-[100vw] gap-4 bg-blue-100 overflow-hidden pt-[var(--navbar-height)]">
      {/* Overlay */}
      {turnStarting && (
        <section 
          className="absolute inset-0 bg-opacity-40 backdrop-blur-sm section-flex items-center justify-center z-50 border-black" 
          aria-modal="true" 
          role="dialog" 
          aria-labelledby="turn-starting-title"
        >
          <article className="nes-container is-rounded bg-white p-8 w-full max-w-md rounded-xl text-center shadow-lg">
            <header>
              {user?.username !== currDrawer && (
                <h2 id="turn-starting-title" className="text-xl font-bold">
                  {currDrawer} is getting ready to draw...
                </h2>
              )}
              {user?.username === currDrawer && (
                <h2 id="turn-starting-title" className="text-2xl font-bold">
                  You&apos;re up!
                </h2>
              )}
            </header>

            {user?.username === currDrawer && (
              <main>
                <p className="text-xl mt-2 italic">Your word: {currWord}</p>
              </main>
            )}
          </article>
        </section>
      )}

      {turnEnding && (
        <section
          className="section-flex absolute inset-0 bg-opacity-60 backdrop-blur-sm items-center justify-center z-50 border-black"
          aria-labelledby="turn-ending-heading"
          role="dialog"
          aria-modal="true"
        >
          <article className="nes-container is-rounded bg-white p-8 rounded-xl text-center shadow-lg max-w-lg w-full">
            <header className="mb-5">
              <h1 id="turn-ending-heading" className="text-lg nes-text">
                The word was...
              </h1>
              <p className="text-lg nes-text is-success uppercase">{currWord}</p>
            </header>

            <nav aria-label="Player scores">
              <ol className="space-y-2">
                {players
                  .sort((a, b) => b.points - a.points)
                  .map((player, idx) => {
                    const diff = pointDifferences[player.name] ?? 0;
                    return (
                      <li
                        key={idx}
                        className="flex justify-between px-4 items-center"
                        aria-posinset={idx + 1}
                        aria-setsize={players.length}
                      >
                        <span>
                          <span className="mr-2">{idx + 1}.</span>
                          <span className="nes-text is-primary">{player.name}</span>
                          <span className="nes-text is-success"> +{diff}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="nes-text is-error">{player.points} pts</span>
                        </span>
                      </li>
                    );
                  })}
              </ol>
            </nav>
          </article>
        </section>
      )}

      {/* Top bar */}
      <section 
        className="section-flex flex-row items-center w-full mt-5 justify-center z-10" 
        aria-label="Game controls and status"
      >
        {!gameStarted ? (
          players.length >= 2 ? (
            <button
              className="nes-btn is-success !px-1 !py-1 !text-sm"
              onClick={startGame}
            >
              Start Game
            </button>
          ) : (
            <p className="text-center text-sm sm:text-lg font-bold">
              Waiting for players...
            </p>
          )
        ) : (
          <div className="flex flex-col items-center w-full">
            <div className="flex flex-row items-center justify-between w-[99%] sm:gap-0 gap-2">
              <div className="text-center text-sm sm:text-lg font-bold">
                Round: {roundNum}
                <div className="nes-text is-error">Time Left {timeLeft}s</div>
                <div className="mt-4">
                  {user?.username !== currDrawer && isGuessing && (
                    // <div className="text-lg mt-1">{"_".repeat(wordLength)}</div>
                    <div className="text-lg mt-1">{maskedWord}</div>
                  )}
                  {user?.username !== currDrawer && !isGuessing && (
                    <div className="text-lg mt-1">{currWord}</div>
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
              </div>
              <button
                type="submit"
                className="nes-btn is-warning !px-1 !py-1 !text-xs !leading-none"
                onClick={endGame}
              >
                End Game
              </button>
            </div>
          </div>
        )}
      </section>

      {gameEnded && (
        <section className="section-flex absolute inset-0 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 border-black">
          <section className="nes-container is-rounded bg-white p-8 rounded-xl text-center shadow-lg max-w-lg w-full">
            <header>
              <h2 className="text-2xl font-bold mb-4">Game Over</h2>
              <p className="text-lg mb-4">Final Scores:</p>
            </header>
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
            <footer>
              <button className="nes-btn mt-6" onClick={() => router.push("/")}>
                Return to Home
              </button>
            </footer>
          </section>
        </section>
      )}

      {/* Main content */}
      <section className="section-flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 w-full h-[100vh] px-2 overflow-hidden">
        <div className="flex flex-row lg:flex-col flex-shrink-0 w-full lg:w-60 h-20 lg:h-full max-h-full lg:max-h-[calc(90vh-2rem)] nes-container gap-2 text-xs bg-white overflow-y-auto">
          {players.map((player, index) => (
            <div
              key={index}
              className="flex lg:flex-col flex-row justify-start items-center lg:items-start nes-container gap-1"
            >
              <div className="nes-text is-primary text-xxs lg:text-xs sm:mr-2">
                {player.name}
              </div>
              <div>
                <span className="nes-text is-error text-xxs lg:text-sm">
                  {player.points}
                </span>
                <span className="hidden sm:inline nes-text is-error text-xxs lg:text-sm">
                  &nbsp;points
                </span>
                {currDrawer === player.name && (
                  <FontAwesomeIcon
                    icon={faPencil}
                    transform={{ y: -2 }}
                    className="ml-2 align-middle"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex lg:w-full lg:h-full max-width-[500px] items-center justify-center">
          <DrawAreaSockets user={username} gameStarted={gameStarted} />
        </div>
          <div className="flex flex-col flex-shrink-0 w-full lg:w-70 h-40 lg:h-full overflow-hidden">
            <GameChat />
          </div>
      </section>
    </main>
  );
}
