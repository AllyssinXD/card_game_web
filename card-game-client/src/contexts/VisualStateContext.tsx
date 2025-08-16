import type { Container, ContainerChild } from "pixi.js";
import {
  createContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from "react";
import useGame from "../hooks/useGame";
import useViewport from "../hooks/useViewport";
import type { Player } from "../types/Player";
import PlayerHand from "../components/PlayerHand";
import type Card from "../types/Card";
import Table from "../components/Table";
import Button from "../components/common/Button";
import type { GameContextProps } from "./GameContext";
import useGUI from "../hooks/useGUI";

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
  const gui = useGUI();
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
    if (game?.gameState.players?.length) {
      setCanRender(true);
    }
  }, [game?.gameState.players]);

  useEffect(() => {
    console.log(game?.gameState.lastCard);
    if (game?.gameState.lastCard) setShowingCenterCard(game.gameState.lastCard);
  }, [game?.gameState.lastCard]);

  // Posições dos jogadores
  const [positions, setPositions] =
    useState<{ x: number; y: number; location: string }[]>();
  const [playersAtOrder, setPlayersAtOrder] = useState<Player[]>(
    game?.gameState.players || []
  );

  const handleCalcPositions = () => {
    const bottom = {
      x: viewport.w / 2,
      y: viewport.h * 0.9 - 20,
      location: "bottom",
    };
    const top = {
      x: viewport.w / 2,
      y: viewport.h * 0.1 + 20,
      location: "top",
    };
    const left = {
      x: viewport.w * 0.05 + 20,
      y: viewport.h / 2,
      location: "left",
    };
    const right = {
      x: viewport.w * 0.95 - 20,
      y: viewport.h / 2,
      location: "right",
    };

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
      positions = [bottom, top];
    }

    if (players.length === 3) {
      positions = [
        bottom,
        {
          x: viewport.w * 0.25,
          y: viewport.h * 0.1 + 20,
          location: "left-top",
        },
        {
          x: viewport.w * 0.75,
          y: viewport.h * 0.1 + 20,
          location: "right-top",
        },
      ];
    }

    if (players.length === 4) {
      positions = [
        bottom, // baixo
        right, // direita
        top, // cima
        left, // esquerda
      ];
    }

    if (players.length === 5) {
      positions = [
        bottom, // jogador 0: baixo
        left, // jogador 1: lateral esquerda
        {
          x: viewport.w * 0.25,
          y: viewport.h * 0.1 + 20,
          location: "left-top",
        }, // jogador 2: topo esquerda
        {
          x: viewport.w * 0.75,
          y: viewport.h * 0.1 + 20,
          location: "right-top",
        }, // jogador 3: topo direita
        right, // jogador 4: lateral direita
      ];
    }

    setPositions(positions);
  };

  useEffect(() => {
    handleCalcPositions();
  }, [game?.gameState.players]);

  useEffect(() => {
    console.log("CARDS CHANGED", cards);
    if (Object.entries(cards).length == 0) {
      setCanRender(false);
      setTimeout(() => {
        setCanRender(true);
      }, 1000);
    }
    Object.entries(cards).forEach(([cardsRefKey, cardRef]) => {
      if (!cardRef) return;
      cardRef.interactive = true;
      console.log("ADDING POINTERDOWN LISTENER", cardsRefKey);
      cardRef.removeAllListeners?.("pointerdown"); // evita acumular listeners
      cardRef.on("pointerdown", () => {
        const [playerId, , cardId] = cardsRefKey.split("_");
        if (playerId === game?.myId) {
          game.actions.playCard(cardId);
        }
        console.log("CARD CLICKED", playerId, cardId);
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

  const handleReload = useCallback(
    (game: GameContextProps) => {
      Object.values(cards).forEach((c) => {
        if (!c) return;
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
      setCards({});
      setPlayersContainers({});
      setCanRender(false);
      setPlayersAtOrder([]);
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
        console.log(game!.gameState.state?.cards);
        setShowingCenterCard(game!.gameState.lastCard!);
        setCanRender(true);
        Object.entries(cards).forEach(([cardsRefKey, cardRef]) => {
          if (!cardRef) return;
          cardRef.interactive = true;
          console.log(cardRef.eventNames());
          cardRef.on("pointerdown", () => {
            const [playerId, , cardId] = cardsRefKey.split("_");
            if (playerId === game?.myId) {
              game.actions.playCard(cardId);
            }
          });
        });
      }, 100);
    },
    [cards, playersContainers, buyCardRef, game]
  );

  const updatePlayerHand = () => {
    if (!game) return;
    setShowingPlayerCards(game.gameState.state.cards);
  };

  useEffect(() => {
    handleReload(game!);
  }, [viewport.h, viewport.w]);

  useEffect(() => {
    if (game?.scene !== "Game") {
      // limpa tudo quando sair do jogo
      handleReload(game!);
    }
  }, [game?.scene]);

  useLayoutEffect(() => {
    const id = gui?.addGUI(
      <pixiContainer zIndex={999}>
        <Button
          x={120}
          y={120}
          color="#0e2755ff"
          text={{ text: "Reload" }}
          height={50}
          width={100}
          onClick={() => {
            handleReload(game!);
          }}
        />
      </pixiContainer>
    );

    gui?.addGUI(
      <pixiContainer zIndex={999}>
        <Button
          x={120}
          y={170}
          color="#0e5520ff"
          text={{ text: "DEBUG" }}
          height={50}
          width={100}
          onClick={() => {
            console.log("DEBUG", {
              cards,
              playersContainers,
              buyCardRef,
              centerCardRef: centerCardRef.current,
              showingCenterCard,
              showingPlayerCards,
            });
          }}
        />
      </pixiContainer>
    );

    return () => {
      // limpa o botão quando desmontar
      gui?.removeGUI(id!);
    };
  }, []);

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
      {canRender && (
        <>
          <Table />
          {playersAtOrder.map((player, i) => {
            if (!playersContainers[player.id]) {
              playersContainers[player.id] = null;
            }
            if (!positions) return null;

            return (
              <pixiContainer x={positions[i].x} y={positions[i].y}>
                <PlayerHand
                  player={player}
                  isOfPlayer={player.id == game?.myId}
                  location={positions[i].location}
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
