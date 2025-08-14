import { createContext, useEffect } from "react";
import useVisualState from "../hooks/useVisualState";
import gsap from "gsap";
import useGame from "../hooks/useGame";

export const AnimationsContext = createContext(null);
function AnimationsProvider() {
  const visualState = useVisualState();
  const game = useGame();
  useEffect(() => {
    if (!visualState) return;

    // Cards Animations
    Object.keys(visualState.cardsRefs).forEach((key) => {
      const card = visualState.cardsRefs[key].current;
      if (!card) return;

      card.interactive = true;

      // Guarda a posição original
      const originalY = card.y;

      // Cards hover animations
      if (key.split("_")[0] !== game?.myId) return;
      card.onpointerenter = () => {
        gsap.to(card, { y: originalY - 10, duration: 0.2 });
      };

      card.onpointerleave = () => {
        gsap.to(card, { y: originalY, duration: 0.2 });
      };
    });
  }, [visualState]);
  return <AnimationsContext.Provider value={null}></AnimationsContext.Provider>;
}

export default AnimationsProvider;
