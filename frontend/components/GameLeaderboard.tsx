import { Player } from "@/components/Game";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface GameLeaderboardProps {
  players: Player[];
  currDrawer: string;
}

const GameLeaderboard = ({ players, currDrawer }: GameLeaderboardProps) => {
  return (
    <div className="flex flex-col nes-container gap-2 text-xs bg-white overflow-y-auto size-full lg:max-w-72 max-h-full min-h-0">
      {players.map((player, index) => (
        <div
          key={index}
          className="flex flex-col justify-start items-start nes-container gap-1"
        >
          <div className="nes-text is-primary text-xs mr-2">{player.name}</div>
          <div>
            <span className="nes-text is-error text-sm">{player.points}</span>
            <span className="hidden sm:inline nes-text is-error text-sm">
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
  );
};

export default GameLeaderboard;
