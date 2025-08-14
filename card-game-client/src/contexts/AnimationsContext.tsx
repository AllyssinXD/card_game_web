import { createContext, useEffect, useLayoutEffect, useState } from "react";
import useVisualState from "../hooks/useVisualState";
import gsap from "gsap";
import useGame from "../hooks/useGame";

export const AnimationsContext = createContext(null);

function AnimationsProvider() {
  const visualState = useVisualState();
  const game = useGame();

  const addHoverCardAnimation = async () => {
    Object.entries(visualState!.cards).forEach(([key, card]) => {
      if (!card || card.destroyed) return;

      card.interactive = true;

      // Apenas cartas do jogador local
      if (key.split("_")[0] !== game?.myId) return;

      const onEnter = () => {
        if (!card || card.destroyed) return;
        gsap.to(card, { y: -10, duration: 0.2 });
      };

      const onLeave = () => {
        if (!card || card.destroyed) return;
        gsap.to(card, { y: 0, duration: 0.2 });
      };

      card.addEventListener("pointerenter", onEnter);
      card.addEventListener("pointerleave", onLeave);
    });
  };

  useEffect(() => {
    visualState?.buyCardRef?.addEventListener("pointerdown", () => {
      console.log("INICIA ANIMAçÂO");
    });
  }, [visualState?.buyCardRef]);

  // Hover nas cartas
  useEffect(() => {
    if (!visualState) return;

    addHoverCardAnimation();
  }, [visualState?.cards, game?.myId]);

  useLayoutEffect(() => {
    if (!visualState) return;
    addHoverCardAnimation();
  }, [visualState?.cards]);

  // Animação quando for o turno do jogador
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
      console.log("MATOU 2");
      if (!visualState) return;
      Object.keys(visualState.cards).forEach((key) => {
        const card = visualState.cards[key];
        gsap.killTweensOf(card); // limpa para não tentar animar depois que desmontar
      });
    };
  }, []);

  return (
    <AnimationsContext.Provider value={null}>
      {/* Caso queira, pode renderizar children aqui */}
    </AnimationsContext.Provider>
  );
}

export default AnimationsProvider;
