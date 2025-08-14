import { useLayoutEffect, useRef } from "react";
import useViewport from "../hooks/useViewport";
import useVisualState from "../hooks/useVisualState";
import CardSprite from "./Card";
import type { Container } from "pixi.js";

function Table() {
  const visualState = useVisualState();
  const viewport = useViewport();

  const centerCardRef = useRef<Container>(null);
  const buyCardRef = useRef<Container>(null);

  useLayoutEffect(() => {
    visualState?.setBuyCardRef(buyCardRef.current);
  }, []);

  return (
    <pixiContainer x={viewport.w / 2} y={viewport.h / 2}>
      <pixiContainer key={"CENTER_CARD"} ref={centerCardRef}>
        <CardSprite x={0} y={0} {...visualState!.showingCenterCard} />
      </pixiContainer>
      <pixiContainer ref={buyCardRef} key={"BUY_CARD"}>
        <CardSprite
          x={-100}
          y={0}
          width={50}
          color="UNKNOWN"
          num="+"
          id="buy"
        />
      </pixiContainer>
    </pixiContainer>
  );
}

export default Table;
