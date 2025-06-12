import { Player } from "@/components/Game";

interface GameBarProps {
  gameStarted: boolean;
  players: Player[];
  startGame: () => void;
  endGame: () => void;
  roundNum: number;
  timeLeft: number;
  isGuessing: boolean;
  currWord: string;
  maskedWord: string;
  isCurrDrawer: boolean;
  gameId: string;
}

const GameBar = ({
  gameStarted,
  players,
  startGame,
  endGame,
  roundNum,
  timeLeft,
  isGuessing,
  currWord,
  maskedWord,
  isCurrDrawer,
  gameId,
}: GameBarProps) => {
  return (
    <div className="flex flex-row items-center w-full justify-center z-10 bg-white border-b-2 border-dashed border-black-500 p-2">
      {/* Game not started */}
      {!gameStarted && (
          <div className="flex flex-col gap-1 text-center w-[95%]  justify-center items-center text-sm sm:text-lg font-bold">
            <div className="nes-text is-primary">Code: {gameId}</div> {/* always show gameId */}
            {players.length >= 2 ? (
              <button
                className="nes-btn is-success !px-1 !py-1 !text-sm"
                onClick={startGame}
              >
                Start Game
              </button>
            ) : (
              <div className="flex text-center text-sm sm:text-lg font-bold">
                Waiting for players...
              </div>
            )}
          </div>
      )}

      {/* Game started */}
      {gameStarted && (
        <>
          <div className="flex  flex-col  gap-2 text-sm">
            <div>Round: {roundNum}</div>
            <div className="nes-text is-error">Time Left {timeLeft}s</div>
          </div>
          <div className="ml-auto sm:mr-auto">
            <WordDisplay
              isCurrDrawer={isCurrDrawer}
              isGuessing={isGuessing}
              maskedWord={maskedWord}
              currWord={currWord}
            />
          </div>
          <div className="sm:block hidden">
            <button
              type="submit"
              className="nes-btn is-warning !text-xs"
              onClick={endGame}
            >
              End Game
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const WordDisplay = ({
  isCurrDrawer,
  isGuessing,
  maskedWord,
  currWord,
}: {
  isCurrDrawer: boolean;
  isGuessing: boolean;
  maskedWord: string;
  currWord: string;
}) => {
  return (
    <div className="mt-1 sm:text-lg text-sm">
      {!isCurrDrawer && (isGuessing ? maskedWord : currWord)}

      {isCurrDrawer && (
        <div>
          <span>My word:</span>{" "}
          <span className="nes-text is-primary">{currWord}</span>
        </div>
      )}
    </div>
  );
};

export default GameBar;
