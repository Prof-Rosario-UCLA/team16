import asyncHandler from "express-async-handler";
import { createGame } from "../services/gameService";

export const generateGame = asyncHandler(async (req: any, res: any) => {
  const gameId = await createGame();
  res.json({ id: gameId });
});
