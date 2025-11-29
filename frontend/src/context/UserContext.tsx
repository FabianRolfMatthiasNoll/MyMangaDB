import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, Role } from "../api";
import { getCurrentUser, isAuthenticated } from "../services/auth";

interface UserContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    if (isAuthenticated()) {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user info", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    await fetchUser();
  };

  const isAdmin = user?.role === Role.Admin;

  return (
    <UserContext.Provider value={{ user, loading, isAdmin, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
