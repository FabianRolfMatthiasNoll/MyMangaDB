import React, { createContext, useContext, useState } from "react";

interface UIState {
  activeComponent: "dashboard" | "settings" | "genre" | "author" | "statistics";
  setActiveComponent: (
    component: "dashboard" | "settings" | "genre" | "author" | "statistics"
  ) => void;
}

const UIContext = createContext<UIState | undefined>(undefined);

interface UIProviderProps {
  children: React.ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [activeComponent, setActiveComponent] = useState<
    "dashboard" | "settings" | "genre" | "author" | "statistics"
  >("dashboard");

  return (
    <UIContext.Provider value={{ activeComponent, setActiveComponent }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};
