import {
  createContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import useVisualState from "../hooks/useVisualState";
import gsap from "gsap";
import useGame from "../hooks/useGame";
import type Card from "../types/Card";
import CardSprite from "../components/Card";
import useViewport from "../hooks/useViewport";

export const AnimationsContext = createContext(null);

interface CardAnimation {
  card: Card;
  originX: number;
  originY: number;
  originRotation: number;
  desX: number;
  desY: number;
  desRotation: number;
  containerKey: string | null;
}

function AnimationsProvider() {
  const visualState = useVisualState();
  const viewport = useViewport();
  const game = useGame();

  const [playCards, setPlayCards] = useState<CardAnimation[]>([]);

  let eventCounter = 0;

  const addHoverCardAnimation = async () => {
    if (!visualState) return;
    Object.entries(visualState.cards).forEach(([key, card]) => {
      console.log(card);
      if (!card || card.destroyed) return;

      console.log(card.destroyed, card.uid, key);

      card.interactive = true;

      // Apenas cartas do jogador local
      if (key.split("_")[0] !== game?.myId) return;

      const onEnter = () => {
        if (!card || card.destroyed) return;
        // animar via proxy também seria mais seguro, mas para hover é ok
        gsap.to(card, { y: -10, duration: 0.2 });
      };

      const onLeave = () => {
        if (!card || card.destroyed) return;
        gsap.to(card, { y: 0, duration: 0.2 });
      };

      // evite adicionar múltiplas vezes: checar se já existem listeners seria ideal
      card.removeAllListeners("pointerenter");
      card.removeAllListeners("pointerleave");
      card.addEventListener("pointerenter", onEnter);
      card.addEventListener("pointerleave", onLeave);
    });
  };

  useEffect(() => {
    if (!game || !visualState) return;
    if (game.lastEvent.startsWith("BUYED")) {
      console.log("ENTROU, COMPROU");
      const params = game.lastEvent.split("_");
      const player = params[1];
      const playerContainer = visualState.playersRefs[player];

      console.log({ params, player, playerContainer });
      if (!visualState.buyCardRef) return;
      if (!playerContainer) return;

      const pos = visualState.buyCardRef.getGlobalPosition(undefined, true);
      const posOfPlayer = playerContainer.getGlobalPosition(undefined, true);
      const cardAnimation: CardAnimation = {
        card: {
          color: "UNKNOWN",
          num: "?",
          id: "BUYING_" + params[2],
        },
        containerKey: null,
        originX: pos.x,
        originY: pos.y,
        originRotation: 0,
        desX: posOfPlayer.x,
        desY: posOfPlayer.y,
        desRotation: 0,
      };
      setPlayCards((prev) => [...prev, cardAnimation]);
    }
  }, [game?.lastEvent]);

  // Hover nas cartas
  useEffect(() => {
    if (!visualState) return;
    console.log("ADDING HOVER ANIMATION");
    addHoverCardAnimation();
  }, [visualState?.cards, game?.myId]);

  useLayoutEffect(() => {
    if (!visualState) return;
    addHoverCardAnimation();
  }, [visualState?.cards]);

  // Animação do turno
  useEffect(() => {
    if (!game || !visualState || !game.myId) return;

    const myPlayerRef = visualState.playersRefs[game.myId];
    if (!myPlayerRef) return;

    if (game.gameState.turn === game.myId) {
      gsap.to(myPlayerRef, { alpha: 1 });
    } else {
      gsap.to(myPlayerRef, { alpha: 0.7 });
    }
  }, [game?.gameState.turn, visualState, game?.myId]);

  useEffect(() => {
    return () => {
      if (!visualState) return;
      Object.keys(visualState.cards).forEach((key) => {
        const card = visualState.cards[key];
        gsap.killTweensOf(card); // kill para evitar tentar animar depois que desmontou
      });
    };
  }, []);

  useEffect(() => {
    if (!game || !visualState) return;
    if (!game.lastEvent) return;

    const params = game.lastEvent.split("_");
    if (params[0] === "PLAYED") {
      const player = game.gameState.players.find((p) => p.id == params[1]);
      if (!player) return;
      const card = game.playedCardsHistory.find((c) => c.id == params[2]);
      if (!card) return;

      if (eventCounter == game?.playedCardsHistory.length) return;

      if (player.id == game.myId) {
        const key = player.id + "_CARD_" + card.id;
        const cardContainer = visualState.cards[key];
        if (!cardContainer) return;
        const pos = cardContainer.getGlobalPosition(undefined, true);
        const cardAnimation: CardAnimation = {
          card,
          containerKey: key,
          originX: pos.x,
          originY: pos.y,
          originRotation: cardContainer.rotation,
          desX: viewport.w / 2,
          desY: viewport.h / 2,
          desRotation: 0,
        };
        setPlayCards((prev) => [...prev, cardAnimation]);
      } else {
        const container = visualState.playersRefs[player.id];
        if (!container) return;
        const cardAnimation: CardAnimation = {
          card,
          containerKey: null,
          originX: container.x,
          originY: container.y,
          originRotation: container.rotation,
          desX: viewport.w / 2,
          desY: viewport.h / 2,
          desRotation: 0,
        };
        setPlayCards((prev) => [...prev, cardAnimation]);
      }
    }
  }, [game?.playedCardsHistory]);

  return (
    <AnimationsContext.Provider value={null}>
      {playCards.map((playCard) => (
        <AnimatedCard
          key={"ANIMATION_CARD_" + playCard.card.id}
          playCard={playCard}
          onFinish={(id) => {
            visualState?.updatePlayerHand();
            setPlayCards((prev) => prev.filter((p) => p.card.id !== id));
          }}
        />
      ))}
    </AnimationsContext.Provider>
  );
}

/**
 * AnimatedCard — usa um proxy para animar as coordenadas e aplica
 * ao container apenas se ele existir (garante que não tentamos escrever
 * em null).
 */
function AnimatedCard({
  playCard,
  onFinish,
}: {
  playCard: CardAnimation;
  onFinish: (id: string) => void;
}) {
  const containerRef = useRef<any>(null);
  const tweenRef = useRef<any>(null);
  const visualState = useVisualState();

  useEffect(() => {
    // proxy com valores iniciais iguais à origem
    const proxy = { x: playCard.originX, y: playCard.originY };

    // atualiza container enquanto ele existir
    const applyToContainer = () => {
      const c = containerRef.current;
      if (!c) return;
      // só ajustar se o container ainda existir
      c.x = proxy.x;
      c.y = proxy.y;
    };

    // garantir que, se o container já existe, sincronize posição inicial
    applyToContainer();

    // cria tween sobre o proxy — GSAP nunca escreve diretamente em `container`
    tweenRef.current = gsap.to(proxy, {
      x: playCard.desX,
      y: playCard.desY,
      duration: 1,
      ease: "power2.out",
      onStart: () => {
        // sinal para atualizar mão do jogador (se necessário)
        visualState?.updatePlayerHand?.();
      },
      onUpdate: applyToContainer,
      onComplete: () => {
        // garante que o container esteja na posição final antes de remover
        applyToContainer();
        onFinish(playCard.card.id);
      },
    });

    // cleanup: mate o tween (não tentar revert, que pode acessar alvos nulos)
    return () => {
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playCard.card.id]); // rodar por card.id — playCard em si pode ser re-criado

  return (
    // passamos a ref para o container PIXI; suas props x/y iniciais são opcionais
    <pixiContainer
      ref={containerRef}
      x={playCard.originX}
      y={playCard.originY}
      key={"ANIMATION_CARD_" + playCard.card.id}
    >
      <CardSprite
        x={0}
        y={0}
        color={playCard.card.color}
        id={"ANIMATION_CARD_" + playCard.card.id}
        num={playCard.card.num}
      />
    </pixiContainer>
  );
}

export default AnimationsProvider;
