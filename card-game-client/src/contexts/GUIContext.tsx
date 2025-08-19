import {
  createContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { VirtualKeyboard } from "../components/common/VirtualKeyboard";
import Text from "../components/common/Text";
import useViewport from "../hooks/useViewport";
import { KeyToText } from "../helpers/TypingFacilities";

export interface GUIContextProps {
  focusId: number | null;
  setFocusId: Dispatch<SetStateAction<number | null>>;
  lastKey: { key: string; id: number } | null;
  setTypingText: Dispatch<SetStateAction<string>>;
  addGUI: (el: ReactNode) => string;
  removeGUI: (id: string) => void;
}

export const GUIContext = createContext<GUIContextProps | null>(null);
function GUIContextProvider({ children }: { children: ReactNode }) {
  const [focusId, setFocusId] = useState<number | null>(null);
  const [lastKey, setLastKey] = useState<{ key: string; id: number } | null>(
    null
  );
  const viewport = useViewport();
  const [typingText, setTypingText] = useState("");
  const [_, setAdicionalGUI] = useState<
    { el: ReactNode; id: string }[]
  >([]);
  const addGUI = (el: ReactNode) => {
    const id = Math.random().toString();
    setAdicionalGUI((prev) => [...prev, { el, id: id }]);
    return id;
  };
  const removeGUI = (id: string) => {
    setAdicionalGUI((prev) => prev.filter((g) => g.id !== id));
  };

  let counter = 0;

  const emitKey = (key: string) => {
    setTypingText((prev) => KeyToText(key, prev));
    setLastKey({ key, id: counter });
    counter++;
  };

  return (
    <GUIContext.Provider
      value={{
        removeGUI,
        addGUI,
        setTypingText,
        lastKey,
        focusId,
        setFocusId,
      }}
    >
      {children}
      {/* Overlay > Ver o que está escrevendo */}
      {viewport.w < 1000 && focusId && (
        <pixiContainer x={viewport.w / 2} y={viewport.h * 0.2}>
          <pixiGraphics
            draw={(g) => {
              g.clear();
              g.setStrokeStyle({
                width: 2,
                color: 0x999999,
              });
              g.fill(0x222222);
              g.roundRect(
                -((viewport.w / 100) * 90) / 2,
                -50 / 2,
                (viewport.w / 100) * 90,
                50,
                6
              );
              g.endFill();
            }}
            zIndex={1}
          />
          <Text
            text={typingText || "Digite aqui..."}
            // 20% da tela de altura
            x={0}
            y={0}
            anchor={0.5}
            zIndex={2}
            style={{
              fill: typingText ? "#ffffff" : "#888888",
              fontSize: viewport.h * 0.05, // tamanho proporcional à tela
            }}
            size={30}
          />
        </pixiContainer>
      )}
      {/*Teclado virtual quando estiver com foco */}
      {viewport.w < 1000 && focusId && (
        <>
          <VirtualKeyboard focusId={focusId} onKeyPress={emitKey} />

          <pixiGraphics
            interactive
            zIndex={1}
            eventMode="passive"
            onPointerDown={() => {
              console.log("desfoca");
              setFocusId(null);
            }} // desfoca
            draw={(g) => {
              g.clear();
              g.beginFill(0x000000, 0); // transparente
              g.drawRect(0, 0, window.innerWidth, window.innerHeight);
              g.endFill();
            }}
          />
        </>
      )}
    </GUIContext.Provider>
  );
}

export default GUIContextProvider;
