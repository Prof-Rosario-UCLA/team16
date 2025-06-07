import { customAlphabet } from "nanoid";
import { Game } from "../models/gameModel";
import { updateUserStats } from "./userService";

const generateId = customAlphabet("1234567890abcdef", 6);

export const createGame = async () => {
  const gameId = generateId();
  await Game.create({ gameId });
  return gameId;
};

export const getGameById = async (gameId: string) => {
  return await Game.findOne({ gameId });
};

// temporary types until game logic is merged
type Player = {
  name: string;
  points: number;
  isDrawing: boolean;
};

type Round = {
  roundNum: number | null;
  drawerIndex: number | null;
  endTime: number | null;
  word: string | null;
  activeGuessers: Map<string, boolean> | null; // maps usernames to booleans - if usr is still guessing, bool is True
};
type GameState = {
  // js guarantees insertion order so this works!
  // global line id to line
  id: string;
  players: Player[]; // player includes points
  round: Round; // round info
  status: string; // notStarted, active, ended
};

export const endGame = async (game: GameState) => {
  const sortedPlayers = game.players.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return a.name.localeCompare(b.name);
  });

  await Game.findOneAndUpdate(
    { gameId: game.id },
    {
      players: sortedPlayers.map((p, i) => ({
        username: p.name,
        points: p.points,
        placement: i + 1,
      })),
      numRounds: game.round.roundNum,
      winner: sortedPlayers[0].name,
      status: "ended",
    }
  );

  // i think this works lmao
  await Promise.all(
    sortedPlayers.map((player, i) =>
      updateUserStats(player.name, {
        games: 1,
        points: player.points,
        wins: i === 0 ? 1 : 0,
      })
    )
  );
};
