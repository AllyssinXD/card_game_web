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
import type Card from "../types/Card";

export interface GameActions {
  start: () => void;
  playCard: (id: string) => void;
  buyCard: () => void;
}

export interface GameContextProps {
  scene: string;
  wsLastMsg: any;
  isInGame: boolean;
  setScene: (scene: string) => void;
  sendJsonMessage: SendJsonMessage;
  setUsername: React.Dispatch<SetStateAction<string>>;
  gameState: GameState;
  myId: string | null;
  actions: GameActions;
  lastEvent: string;
}

export interface GameState {
  gameState: string;
  lastCard: Card | null;
  turn: string;
  players: Player[];
  state: {
    cards: Card[];
  };
}

export const GameContext = createContext<GameContextProps | null>(null);
function GameContextProvider({ children }: { children: ReactNode }) {
  const [scene, setScene] = useState("MainMenu");
  const [socketUrl, setSocketUrl] = useState<string | null>("");
  const [isInGame, setIsInGame] = useState(false);
  const [username, setUsername] = useState("guest");
  // Estados separados para o game
  const [gamePhase, setGamePhase] = useState<string>("STOP"); // antes gameState.gameState
  const [lastCard, setLastCard] = useState<Card | null>(null);
  const [lastEvent, setLastEvent] = useState<string>("");
  const [turn, setTurn] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [myId, setMyId] = useState<string | null>(null);

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

  const start = () => {
    sendJsonMessage({ action: "START_GAME" });
  };

  const playCard = (cardId: string) => {
    sendJsonMessage({ action: "PLAY_" + cardId });
  };

  const buyCard = () => {
    sendJsonMessage({ action: "BUY" });
  };

  useEffect(() => {
    if (scene === "Lobby" || scene === "Game") {
      setSocketUrl(import.meta.env.VITE_API_URL); // sua URL de WS
      setIsInGame(true);
    } else {
      setSocketUrl(null); // desconecta
      setIsInGame(false);
    }
  }, [scene]);

  useEffect(() => {
    if (!wsLastMsg) return;

    const res = wsLastMsg as any;

    if (res.yourId) {
      setMyId(res.yourId);
    }

    if (res.gameState) setGamePhase(res.gameState);
    if ("lastCard" in res) setLastCard(res.lastCard);
    if ("turn" in res) setTurn(res.turn);
    if ("players" in res) setPlayers(res.players);
    if (res.state?.cards) setCards(res.state.cards);
    if (res.event) setLastEvent(res.event);
  }, [wsLastMsg]);

  useEffect(() => {
    if (gamePhase === "GOING") {
      setScene("Game");
    } else if (gamePhase === "WAITING_PLAYERS") {
      setScene("Lobby");
    }
  }, [gamePhase]);

  return (
    <GameContext.Provider
      value={{
        lastEvent,
        actions: { buyCard, playCard, start },
        myId,
        gameState: {
          gameState: gamePhase,
          lastCard,
          turn,
          players,
          state: {
            cards,
          },
        },
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
