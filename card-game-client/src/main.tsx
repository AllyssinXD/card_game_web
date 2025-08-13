import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import GameContextProvider from "./contexts/GameContext.tsx";
import "./App.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GameContextProvider>
      <App />
    </GameContextProvider>
  </StrictMode>
);
