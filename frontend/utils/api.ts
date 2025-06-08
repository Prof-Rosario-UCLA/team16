import { LeaderboardResponse, User, UserStatsResponse } from "@/utils/types";
import axios from "axios";

export const baseURL =
  process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_PWA_DEBUGGING === "false" ? "" : "http://localhost:3001";
const apiURL = `${baseURL}/api`;

export const createGame = async () => {
  const res = await axios.post(`${apiURL}/game`, {}, { withCredentials: true });
  return res;
};

export const login = async (username: string, password: string) => {
  const rest = await axios.post(
    `${apiURL}/login/session`,
    { username, password },
    { withCredentials: true }
  );
  return rest;
};

export const register = async (username: string, password: string) => {
  const res = await axios.post(
    `${apiURL}/login`,
    { username, password },
    { withCredentials: true }
  );
  return res;
};

export const logout = async () => {
  const res = await axios.delete(`${apiURL}/login/session`, {
    withCredentials: true,
  });
  return res;
};

export const getUser = async (): Promise<User> => {
  const res = await axios.get(`${apiURL}/user/me`, {
    withCredentials: true,
  });
  return res.data;
};

export const getLeaderboard = async (): Promise<LeaderboardResponse> => {
  const res = await axios.get(`${apiURL}/leaderboard`, {
    withCredentials: true,
  });
  return res.data;
};

export const getUserStats = async (
  username: string
): Promise<UserStatsResponse> => {
  const res = await axios.get(`${apiURL}/user/${username}/stats`, {
    withCredentials: true,
  });
  return res.data;
};
