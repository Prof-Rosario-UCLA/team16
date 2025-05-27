"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface UserContextType {
  user: unknown; // Replace 'any' with a more specific type if available
  loading: boolean;
}

const UserContext = createContext<UserContextType|null>(null);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // on app load, check if user is logged in
  useEffect(() => {
    axios
      .get("http://localhost:3001/api/user/me", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(((err) => {
        console.warn("Not logged in:", err?.response?.data || err.message);
        setUser(null);
      }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
