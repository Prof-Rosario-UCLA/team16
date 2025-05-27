import { customAlphabet } from "nanoid";
import asyncHandler from "express-async-handler";

const generateId = customAlphabet("1234567890abcdef", 6);

export const generateGame = asyncHandler(async (req: any, res: any) => {
  const gameId = generateId();
  res.json({ id: gameId });
});

