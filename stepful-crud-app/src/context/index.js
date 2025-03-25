// context/AppControllerContext.js
import { createContext, useContext, useState } from "react";

const AppControllerContext = createContext();

export function AppControllerProvider({ children }) {
  const [mode, setMode] = useState("coach");

  const value = {
    mode,
    setMode,
  };

  return (
    <AppControllerContext.Provider value={value}>
      {children}
    </AppControllerContext.Provider>
  );
}

export function useAppController() {
  return useContext(AppControllerContext);
}
