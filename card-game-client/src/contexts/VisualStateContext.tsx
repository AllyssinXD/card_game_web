import type { Container } from "pixi.js";
import {
  createContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import useGame from "../hooks/useGame";
import Text from "../components/common/Text";
import useViewport from "../hooks/useViewport";
import type { Player } from "../types/Player";
import PlayerHand from "../components/PlayerHand";

interface VisualStateContextProps {
  playersRefs: Record<string, RefObject<Container | null>>;
  cardsRefs: Record<string, RefObject<Container | null>>;
  centerCard: RefObject<Container | null>;
}

export const VisualStateContext = createContext<VisualStateContextProps | null>(
  null
);

export default function VisualStateProvider({
  children,
}: {
  children: ReactNode;
}) {
  const game = useGame();
  const viewport = useViewport();

  const playersRefs = useRef<Record<string, RefObject<Container | null>>>({});
  const cardsRefs = useRef<Record<string, RefObject<Container | null>>>({});
  const centerCard = useRef<Container | null>(null);

  // Estado para renderizar o jogo somente quando estiver pronto
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    if (game?.gameState.players?.length && game?.gameState.lastCard) {
      setCanRender(true);
    }
  }, [game?.gameState.players, game?.gameState.lastCard]);

  // Log de debug a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log({
        playersRefs: playersRefs.current,
        cardsRefs: cardsRefs.current,
        centerCard,
      });
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Posições dos jogadores
  const [positions, setPositions] = useState<{ x: number; y: number }[]>();
  const [playersAtOrder, setPlayersAtOrder] = useState<Player[]>(
    game?.gameState.players || []
  );

  useEffect(() => {
    const players = game?.gameState.players;
    const currentPlayerIndex = players?.findIndex((p) => p.id === game?.myId);

    if (!players || currentPlayerIndex === -1) return;

    // Rotaciona array para que o jogador atual fique sempre em primeiro
    setPlayersAtOrder([
      ...players.slice(currentPlayerIndex),
      ...players.slice(0, currentPlayerIndex),
    ]);

    let positions: { x: number; y: number }[] = [];

    // Posições de acordo com a quantidade de jogadores
    if (players.length === 2) {
      positions = [
        { x: viewport.w / 2, y: viewport.h - 50 },
        { x: viewport.w / 2, y: 100 },
      ];
    }

    if (players.length === 3) {
      positions = [
        { x: viewport.w / 2, y: viewport.h - 20 },
        { x: 300, y: 100 },
        { x: viewport.w - 300, y: 100 },
      ];
    }

    if (players.length === 4) {
      positions = [
        { x: viewport.w / 2, y: viewport.h - 20 }, // baixo
        { x: viewport.w - 100, y: viewport.h / 2 }, // direita
        { x: viewport.w / 2, y: 20 }, // cima
        { x: 100, y: viewport.h / 2 }, // esquerda
      ];
    }

    if (players.length === 5) {
      positions = [
        { x: viewport.w / 2, y: viewport.h - 50 }, // jogador 0: baixo
        { x: 400, y: 100 }, // jogador 1: topo esquerda
        { x: viewport.w - 400, y: 100 }, // jogador 2: topo direita
        { x: 50, y: viewport.h / 2 }, // jogador 3: lateral esquerda
        { x: viewport.w - 50, y: viewport.h / 2 }, // jogador 4: lateral direita
      ];
    }

    setPositions(positions);
  }, [game?.gameState.players]);

  // Ajusta pivôs dos jogadores
  useEffect(() => {}, [positions]);

  return (
    <VisualStateContext.Provider
      value={{
        playersRefs: playersRefs.current,
        cardsRefs: cardsRefs.current,
        centerCard,
      }}
    >
      {canRender && (
        <>
          {playersAtOrder.map((player, i) => {
            if (!playersRefs.current[player.id]) {
              playersRefs.current[player.id] = { current: null };
            }
            if (!positions) return null;

            return (
              <pixiContainer
                key={player.id}
                ref={(el) => {
                  playersRefs.current[player.id].current = el;
                  if (el) el.pivot.set(el?.width / 2, el?.height / 2);
                }}
                x={positions[i].x}
                y={positions[i].y}
              >
                <pixiContainer anchor={0.5}>
                  <PlayerHand
                    player={player}
                    cardRefs={cardsRefs}
                    position={
                      playersAtOrder.length === 5 && i === 3
                        ? "left"
                        : playersAtOrder.length === 5 && i === 4
                        ? "right"
                        : playersAtOrder.length === 5 && i === 0
                        ? "bottom"
                        : "top"
                    }
                  />
                </pixiContainer>
                <Text text={player.username} />
              </pixiContainer>
            );
          })}
        </>
      )}
      {canRender && children}
    </VisualStateContext.Provider>
  );
}
