import { Application } from "@pixi/react";
import { useEffect, useRef } from "react";
import { Scenes, type SceneKey } from "./Scenes";
import useGame from "./hooks/useGame";
import useViewport from "./hooks/useViewport";
import GUIContextProvider from "./contexts/GUIContext";

function App() {
  const resizeRef = useRef<HTMLDivElement>(null);
  const game = useGame();
  const CurrentScene = Scenes[game!.scene as SceneKey];
  const viewport = useViewport();

  useEffect(() => {
    console.log(viewport);
  }, [viewport.w]);

  return (
    <div className="w-full h-screen" ref={resizeRef}>
      <Application autoStart roundPixels resizeTo={resizeRef} antialias={false}>
        <GUIContextProvider>
          <CurrentScene />
        </GUIContextProvider>
      </Application>
    </div>
  );
}

export default App;
