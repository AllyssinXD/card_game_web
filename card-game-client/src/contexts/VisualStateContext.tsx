import type { Container, ContainerChild } from "pixi.js";
import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from "react";
import useGame from "../hooks/useGame";
import Text from "../components/common/Text";
import useViewport from "../hooks/useViewport";
import type { Player } from "../types/Player";
import PlayerHand from "../components/PlayerHand";
import type Card from "../types/Card";
import Table from "../components/Table";
import Button from "../components/common/Button";

interface VisualStateContextProps {
  playersRefs: Record<string, Container<ContainerChild> | null>;
  cards: Record<string, Container<ContainerChild> | null>;
  setCard: (key: string, el: Container | null) => void;
  setPlayerContainer: (key: string, el: Container | null) => void;
  buyCardRef: Container | null;
  setBuyCardRef: Dispatch<SetStateAction<Container | null>>;
  centerCardRef: RefObject<Container | null>;
  setShowingCenterCard: Dispatch<SetStateAction<Card>>;
  showingCenterCard: Card;
  showingPlayerCards: Card[];
  updatePlayerHand: () => void;
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
  const [playersContainers, setPlayersContainers] = useState<
    Record<string, Container | null>
  >({});
  const setPlayerContainer = useCallback(
    (key: string, el: Container<ContainerChild> | null) => {
      if (playersContainers[key] === el) return;
      setPlayersContainers((prev) => {
        // evita re-render desnecessário
        return { ...prev, [key]: el }; // cria novo objeto
      });
    },
    []
  );
  const [cards, setCards] = useState<Record<string, Container | null>>({});

  const setCard = useCallback(
    (key: string, el: Container<ContainerChild> | null) => {
      if (el == null) return;
      setCards((prev) => {
        if (cards[key] === el) return prev;
        // evita re-render desnecessário
        return { ...prev, [key]: el }; // cria novo objeto
      });
    },
    []
  );
  const centerCardRef = useRef<Container | null>(null);
  const [buyCardRef, setBuyCardRef] = useState<Container | null>(null);

  const [showingCenterCard, setShowingCenterCard] = useState<Card>(
    game?.gameState.lastCard || {
      color: "UNKNOWN",
      num: "?",
      id: "center",
    }
  );

  const [showingPlayerCards, setShowingPlayerCards] = useState<Card[]>(
    game?.gameState.state.cards || [
      {
        color: "UNKNOWN",
        num: "?",
        id: "center",
      },
    ]
  );

  // Estado para renderizar o jogo somente quando estiver pronto
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    if (game?.gameState.players?.length && game?.gameState.lastCard) {
      setCanRender(true);
      setShowingCenterCard(game.gameState.lastCard);
    }
  }, [game?.gameState.players, game?.gameState.lastCard]);

  // Posições dos jogadores
  const [positions, setPositions] =
    useState<{ x: number; y: number; location: string }[]>();
  const [playersAtOrder, setPlayersAtOrder] = useState<Player[]>(
    game?.gameState.players || []
  );

  const handleCalcPositions = () => {
    const players = game?.gameState.players;
    const currentPlayerIndex = players?.findIndex((p) => p.id === game?.myId);

    if (!players || currentPlayerIndex === -1) return;

    // Rotaciona array para que o jogador atual fique sempre em primeiro
    setPlayersAtOrder([
      ...players.slice(currentPlayerIndex),
      ...players.slice(0, currentPlayerIndex),
    ]);

    let positions: { x: number; y: number; location: string }[] = [];

    // Posições de acordo com a quantidade de jogadores
    if (players.length === 2) {
      positions = [
        { x: viewport.w / 2, y: viewport.h - 50, location: "bottom" },
        { x: viewport.w / 2, y: 100, location: "top" },
      ];
    }

    if (players.length === 3) {
      positions = [
        { x: viewport.w / 2, y: viewport.h - 20, location: "bottom" },
        { x: 300, y: 100, location: "left-top" },
        { x: viewport.w - 300, y: 100, location: "right-top" },
      ];
    }

    if (players.length === 4) {
      positions = [
        { x: viewport.w / 2, y: viewport.h - 20, location: "bottom" }, // baixo
        { x: viewport.w, y: viewport.h / 2, location: "right" }, // direita
        { x: viewport.w / 2, y: 100, location: "top" }, // cima
        { x: 100, y: viewport.h / 2, location: "left" }, // esquerda
      ];
    }

    if (players.length === 5) {
      positions = [
        { x: viewport.w / 2, y: viewport.h - 50, location: "bottom" }, // jogador 0: baixo
        { x: 100, y: viewport.h / 2, location: "left" }, // jogador 1: lateral esquerda
        { x: 400, y: 70, location: "left-top" }, // jogador 2: topo esquerda
        { x: viewport.w - 400, y: 70, location: "right-top" }, // jogador 3: topo direita
        { x: viewport.w - 100, y: viewport.h / 2, location: "right" }, // jogador 4: lateral direita
      ];
    }

    setPositions(positions);
  };

  useEffect(() => {
    handleCalcPositions();
  }, [game?.gameState.players]);

  useEffect(() => {
    if (Object.entries(cards).length == 0) {
      setCanRender(false);
      setTimeout(() => {
        setCanRender(true);
      }, 1000);
    }
    Object.entries(cards).forEach(([cardsRefKey, cardRef]) => {
      if (!cardRef) return;
      cardRef.interactive = true;
      cardRef.removeAllListeners?.("pointerdown"); // evita acumular listeners
      cardRef.on("pointerdown", () => {
        const [playerId, , cardId] = cardsRefKey.split("_");
        if (playerId === game?.myId) {
          game.actions.playCard(cardId);
        }
      });
    });
  }, [cards]);

  useEffect(() => {
    if (!buyCardRef) return;
    buyCardRef.interactive = true;
    buyCardRef.onpointerdown = () => {
      game?.actions.buyCard();
    };
  }, [buyCardRef]);

  const handleReload = () => {
    Object.values(cards).forEach((c) => {
      if (!c) return;
      try {
        (c as any).removeAllListeners?.();
      } catch (err) {}
      try {
        gsap.killTweensOf(c);
      } catch (err) {}
    });

    Object.values(playersContainers).forEach((c) => {
      if (!c) return;
      try {
        (c as any).removeAllListeners?.();
      } catch (err) {}
      try {
        gsap.killTweensOf(c);
      } catch (err) {}
    });

    if (buyCardRef) {
      try {
        (buyCardRef as any).removeAllListeners?.();
      } catch (err) {}
      try {
        gsap.killTweensOf(buyCardRef);
      } catch (err) {}
      setBuyCardRef(null);
    }

    // 2) limpar estados locais
    setCanRender(false);
    setPlayersAtOrder([]);
    setPlayersContainers({});
    setCards({});
    setShowingPlayerCards([]);
    setShowingCenterCard({
      color: "UNKNOWN",
      num: "?",
      id: "center",
    });
    centerCardRef.current = null;

    // 3) re-montar após próximo tick (ou delay curto)
    setTimeout(() => {
      handleCalcPositions();
      setShowingPlayerCards(game!.gameState.state?.cards || []);
      setCanRender(true);
    }, 100);
  };

  const updatePlayerHand = () => {
    if (!game) return;
    setShowingPlayerCards(game.gameState.state.cards);
  };

  useEffect(() => {
    handleReload();
  }, [viewport.h, viewport.w]);

  return (
    <VisualStateContext.Provider
      value={{
        updatePlayerHand,
        setPlayerContainer,
        setCard,
        buyCardRef,
        setBuyCardRef,
        showingPlayerCards,
        playersRefs: playersContainers,
        cards,
        centerCardRef,
        showingCenterCard,
        setShowingCenterCard,
      }}
    >
      <Button
        x={120}
        y={120}
        color="#0e2755ff"
        text={{ text: "Reload" }}
        height={50}
        width={100}
        onClick={() => {
          handleReload();
        }}
      />
      {canRender && (
        <>
          <Table />
          {playersAtOrder.map((player, i) => {
            if (!playersContainers[player.id]) {
              playersContainers[player.id] = null;
            }
            if (!positions) return null;

            return (
              <pixiContainer
                key={player.id}
                ref={(el) => {
                  playersContainers[player.id] = el;
                  if (el) el.pivot.set(el?.width / 2, 0);
                }}
                x={positions[i].x}
                y={positions[i].y}
              >
                <pixiContainer>
                  <PlayerHand
                    player={player}
                    isOfPlayer={player.id == game?.myId}
                    location={positions[i].location}
                  />
                </pixiContainer>
                <Text
                  {...{
                    rotation:
                      positions[i].location == "left"
                        ? Math.PI * 0.5
                        : positions[i].location == "right"
                        ? Math.PI * -0.5
                        : 0,
                    ref: (el: any) => {
                      if (
                        positions[i].location == "left" ||
                        positions[i].location == "right"
                      )
                        el?.pivot.set(el.width / 2, el.height / 2);
                    },
                  }}
                  text={player.username}
                  y={
                    positions[i].location.includes("top")
                      ? 50
                      : positions[i].location == "bottom"
                      ? -50
                      : 0
                  }
                  x={
                    positions[i].location == "left"
                      ? 100
                      : positions[i].location == "right"
                      ? -100
                      : 0
                  }
                />
              </pixiContainer>
            );
          })}
        </>
      )}
      {canRender && children}
    </VisualStateContext.Provider>
  );
}
