import { Router } from "express";
import { customAlphabet } from "nanoid";

const router = Router();
const generateId = customAlphabet("1234567890abcdef", 6);

router.post("/", (req, res) => {
  // create game logic here
  res.json({ gameId: generateId() });
});

export default router;
