import { Word } from "../models/wordModel";

export const getRandomWord = async (
  usedWords: string[] = []
): Promise<string> => {
  // retrieve a random word that is not one of the used words
  let [randomWord] = await Word.aggregate([
    { $match: { text: { $nin: usedWords } } },
    { $sample: { size: 1 } },
  ]);

  // if all words were used, sample from all
  if (!randomWord) {
    [randomWord] = await Word.aggregate([{ $sample: { size: 1 } }]);
  }

  if (!randomWord) {
    throw new Error("No word found");
  }

  return randomWord.text;
};
