import { Application } from "@pixi/react";
import { useRef } from "react";
import { Scenes, type SceneKey } from "./Scenes";
import useGame from "./hooks/useGame";

function App() {
  const resizeRef = useRef<HTMLDivElement>(null);
  const game = useGame();
  const CurrentScene = Scenes[game!.scene as SceneKey];

  return (
    <div className="w-full h-screen" ref={resizeRef}>
      <Application autoStart roundPixels resizeTo={resizeRef} antialias={false}>
        <CurrentScene />
      </Application>
    </div>
  );
}

export default App;
