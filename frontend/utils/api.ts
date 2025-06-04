import axios from "axios";

export const baseURL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:3001";
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

export const getUser = async () => {
  const res = await axios.get(`${apiURL}/user/me`, {
    withCredentials: true,
  });
  return res;
};
