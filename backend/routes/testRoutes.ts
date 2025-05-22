import { Router } from "express";
import { Test } from "../models/testModel";

const router = Router();

router.get("/", async (req, res) => {
  // create game logic here
  const test = await Test.findOne({});
  res.json(test);
});

export default router;
