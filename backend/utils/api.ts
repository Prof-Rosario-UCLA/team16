import axios from "axios";

export const baseURL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:3001";
const apiURL = `${baseURL}/api`;

export const getRandomWord = async (usedWords: string[]) => {
  const res = await axios.get(`${apiURL}/word/randomWord`, {
    params: { usedWords },
  });
  return res.data;
};