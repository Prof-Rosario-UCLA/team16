import { Word } from "../models/wordModel";
import asyncHandler from "express-async-handler"

export const getRandomWord = asyncHandler(async (req: any, res: any) => {
  const usedWords = Array.isArray(req.query.usedWords)
		? req.query.usedWords
		: req.query.usedWords
		? [req.query.usedWords]
		: [];

  // retreive a random word that is not one of the used words
  let [randomWord] = await Word.aggregate([
    { $match: { text: { $nin: usedWords } } },
    { $sample: { size: 1 } }
  ]);

	// if all words were used, sample from all
  if (!randomWord) {
    [randomWord] = await Word.aggregate([{ $sample: { size: 1 } }]);
  }

	if (!randomWord) {
    return res.status(404).json({ message: "No word found" });
  }

  res.status(200).json(randomWord);
});