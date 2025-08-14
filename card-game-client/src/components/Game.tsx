import AnimationsProvider from "../contexts/AnimationsContext";
import VisualStateProvider from "../contexts/VisualStateContext";

function Game() {
  return (
    <pixiContainer>
      <VisualStateProvider>
        <AnimationsProvider />
      </VisualStateProvider>
    </pixiContainer>
  );
}

export default Game;
