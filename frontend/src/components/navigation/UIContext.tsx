import React, { createContext, useContext, useState } from "react";

interface UIState {
  isSettingsOpen: boolean;
  toggleSettings: () => void;
}

const UIContext = createContext<UIState | undefined>(undefined);

interface UIProviderProps {
  children: React.ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <UIContext.Provider value={{ isSettingsOpen, toggleSettings }}>
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
