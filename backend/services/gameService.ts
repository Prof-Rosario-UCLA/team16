import { customAlphabet } from "nanoid";
import { Game } from "../models/gameModel";
import { updateUserStats } from "./userService";
import { GameState } from "../sockets/gameSocket";

const generateId = customAlphabet("1234567890abcdef", 6);

export const createGame = async () => {
  const gameId = generateId();
  await Game.create({ gameId });
  return gameId;
};

export const getGameStatus = async (gameId: string) => {
  const game = await Game.findOne({ gameId });
  return game?.status;
};

export const setGameStatus = async (
  gameId: string,
  status: "pending" | "in_progress" | "finished"
) => {
  await Game.findOneAndUpdate({ gameId }, { status });
};

export const dbOnGameEnd = async (game: GameState) => {
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
      status: "finished",
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
  console.log("Stats updated for players:", sortedPlayers);
};
