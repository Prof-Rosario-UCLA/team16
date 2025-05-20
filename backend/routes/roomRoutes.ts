import { Router } from "express";
const router = Router();

router.post("/", (req, res) => {
  // create game logic here
  const newRoomId = 123;
  res.json({ id: newRoomId });
});

export default router;
