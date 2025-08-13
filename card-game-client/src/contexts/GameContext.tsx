import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
  type SetStateAction,
} from "react";
import useWebSocket from "react-use-websocket";
import type { SendJsonMessage } from "react-use-websocket/dist/lib/types";

export interface GameContextProps {
  scene: string;
  wsLastMsg: string;
  isInGame: boolean;
  setScene: (scene: string) => void;
  sendJsonMessage: SendJsonMessage;
  setUsername: React.Dispatch<SetStateAction<string>>;
}
export const GameContext = createContext<GameContextProps | null>(null);
function GameContextProvider({ children }: { children: ReactNode }) {
  const [scene, setScene] = useState("MainMenu");
  const [wsLastMsg, setLastMessage] = useState<any>();
  const [socketUrl, setSocketUrl] = useState<string | null>("");
  const [isInGame, setIsInGame] = useState(false);
  const [username, setUsername] = useState("guest");

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(socketUrl, {
    share: true, // permite reuso do hook
    shouldReconnect: () => true, // reconecta automaticamente
    queryParams: {
      username,
    },
  });

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
    if (lastJsonMessage) {
      setLastMessage(JSON.stringify(lastJsonMessage));
    }
  }, [lastJsonMessage]);

  return (
    <GameContext.Provider
      value={{
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
