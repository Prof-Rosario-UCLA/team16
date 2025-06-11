"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getUser } from "@/utils/api";
import { User } from "@/utils/types";

interface UserContextType {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await getUser();
      setUser(res);
      localStorage.setItem("cachedUser", JSON.stringify(res));
    } catch (err) {
      console.warn("Not logged in:", err);
      if (err instanceof Error && err.message === "JWT expired") {
        localStorage.removeItem("cachedUser");
        setUser(null);
      }
      else {
        const cached = localStorage.getItem("cachedUser");
        if (cached) {
          setUser(JSON.parse(cached));
        } else {
          setUser(null);
        }
      }
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
