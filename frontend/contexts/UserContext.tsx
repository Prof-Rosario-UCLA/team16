"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface UserContextType {
  user: unknown; // Replace 'any' with a more specific type if available
  loading: boolean;
  fetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3001/api/user/me", { withCredentials: true });
      setUser(res.data);
    } catch (err) {
      console.warn("Not logged in:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, fetchUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
