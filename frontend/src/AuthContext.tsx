import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthorized: boolean;
  isLoggedIn: boolean;
  setIsAuthorized: (isAuthorized: boolean) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    const isAuth = localStorage.getItem('isAuthorized');
    return isAuth === 'true';
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const isLogged = localStorage.getItem('isLoggedIn');
    return isLogged === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isAuthorized', isAuthorized.toString());
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
  }, [isAuthorized, isLoggedIn]);

  return (
    <AuthContext.Provider value={{ isAuthorized, setIsAuthorized, isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
