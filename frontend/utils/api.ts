import { LeaderboardResponse, User, UserStatsResponse } from "@/utils/types";
import axios from "axios";

export const baseURL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:3001";
const apiURL = `${baseURL}/api`;

export const createGame = async () => {
  try {
    const res = await axios.post(`${apiURL}/game`, {}, { withCredentials: true });
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const login = async (username: string, password: string) => {
  try {
    const rest = await axios.post(
      `${apiURL}/login/session`,
      { username, password },
      { withCredentials: true }
    );
    return rest;
  } catch (error) {
    console.log(error);
  }
};

export const register = async (username: string, password: string) => {
  try {
    const res = await axios.post(
      `${apiURL}/login`,
      { username, password },
      { withCredentials: true }
    );
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const logout = async () => {
  try {
    const res = await axios.delete(`${apiURL}/login/session`, {
      withCredentials: true,
    });
    return res;
  } catch (error) {
    console.log(error);
  }
};

export const getUser = async (): Promise<User|null> => {
  try {
    const res = await axios.get(`${apiURL}/user/me`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getLeaderboard = async (): Promise<LeaderboardResponse|null> => {
  try {
    const res = await axios.get(`${apiURL}/leaderboard`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getUserStats = async (
  username: string
): Promise<UserStatsResponse|null> => {
  try {
    const res = await axios.get(`${apiURL}/user/${username}/stats`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const ping = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout
    const res = await axios.get(`/?t=${Date.now()}`, {
      withCredentials: true,
      headers: { "Cache-Control": "no-store, no-cache", "Expires": "0" },
    });
    clearTimeout(timeoutId);
    return res.status === 200;
  } catch (error) {
    console.log("Ping failed", error);
    return false;
  }
}
