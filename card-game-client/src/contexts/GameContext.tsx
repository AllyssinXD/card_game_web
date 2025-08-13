import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
  type SetStateAction,
} from "react";
import useWebSocket from "react-use-websocket";
import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import type { Player } from "../types/Player";

export interface GameContextProps {
  scene: string;
  wsLastMsg: any;
  isInGame: boolean;
  setScene: (scene: string) => void;
  sendJsonMessage: SendJsonMessage;
  setUsername: React.Dispatch<SetStateAction<string>>;
  gameState: GameState;
}

export interface GameState {
  players: Player[];
}

export const GameContext = createContext<GameContextProps | null>(null);
function GameContextProvider({ children }: { children: ReactNode }) {
  const [scene, setScene] = useState("MainMenu");
  const [socketUrl, setSocketUrl] = useState<string | null>("");
  const [isInGame, setIsInGame] = useState(false);
  const [username, setUsername] = useState("guest");
  const [gameState, setGameState] = useState<GameState>({
    players: [],
  });

  const { sendJsonMessage, lastJsonMessage: wsLastMsg } = useWebSocket(
    socketUrl,
    {
      share: true, // permite reuso do hook
      shouldReconnect: () => true, // reconecta automaticamente
      queryParams: {
        username,
      },
    }
  );

  useEffect(() => {
    if (scene === "Lobby") {
      setSocketUrl(import.meta.env.VITE_API_URL); // sua URL de WS
      setIsInGame(true);
    } else {
      setSocketUrl(null); // desconecta
      setIsInGame(false);
    }
  }, [scene]);

  useEffect(() => {
    const res = wsLastMsg as any;
    if (res) {
      console.log(res);
      if (res.players)
        setGameState((prev) => ({
          ...prev,
          players: res.players,
        }));
    }
  }, [wsLastMsg]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        scene,
        setScene,
        wsLastMsg,
        isInGame,
        sendJsonMessage,
        setUsername,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export default GameContextProvider;
