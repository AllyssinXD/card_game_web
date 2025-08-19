import { useCallback, useState } from "react";
import Text from "./Text";
import useViewport from "../../hooks/useViewport";
import useGUI from "../../hooks/useGUI";

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  focusId: number | null;
}

// Layout ABNT2 simplificado
const letters = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "´", "`"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ç", "~", "^"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", ";", "←"],
  ["?123", "SHIFT", " ", "OK"],
];

const symbols = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["!", "@", "#", "$", "%", "¨", "&", "*", "(", ")", "_", "+"],
  ["[", "]", "{", "}", ";", ":", "/", "?", "\\", "|", "←"],
  ["ABC", "SHIFT", " ", "OK"],
];

export function VirtualKeyboard({ onKeyPress, focusId }: VirtualKeyboardProps) {
  const viewport = useViewport();
  const [mode, setMode] = useState<0 | 1>(0); // 0 = letras, 1 = números/símbolos

  const gui = useGUI();

  const totalRows = letters.length;
  const keyboardHeight = viewport.h / 2; // metade da tela
  const rowHeight = keyboardHeight / totalRows;

  const renderKey = useCallback(
    (
      key: string,
      x: number,
      y: number,
      keyWidth: number,
      keyHeight: number
    ) => {
      return (
        <pixiContainer
          key={`${key}-${x}-${y}`}
          x={x}
          y={y}
          eventMode="static"
          onPointerDown={() => {
            if (key === "?123") setMode(1);
            else if (key === "ABC") setMode(0);
            else if (key === "OK") gui?.setFocusId(null);
            else onKeyPress(key === "←" ? "BACKSPACE" : key);
          }}
        >
          <pixiGraphics
            draw={(g) => {
              g.clear();
              g.beginFill(0x333333);
              g.lineStyle(2, 0x727272);
              g.drawRoundedRect(0, 0, keyWidth, keyHeight, 6);
              g.endFill();
            }}
          />
          <Text
            text={key}
            x={keyWidth / 2}
            y={keyHeight / 2}
            anchor={0.5}
            style={{
              fill: "#fff",
              fontSize: keyHeight * 0.4,
            }}
          />
        </pixiContainer>
      );
    },
    [onKeyPress]
  );

  if (!focusId) return null;

  const keysToRender = mode === 0 ? letters : symbols;

  return (
    <pixiContainer x={0} y={viewport.h - keyboardHeight}>
      {/* Fundo do teclado */}
      <pixiGraphics
        draw={(g) => {
          g.clear();
          g.beginFill(0x111111);
          g.lineStyle(2, 0xffffff);
          g.drawRoundedRect(0, 0, viewport.w, keyboardHeight, 8);
          g.endFill();
        }}
      />

      {/* Renderiza linhas */}
      {keysToRender.map((row, rowIndex) => {
        const rowY = rowIndex * rowHeight;
        const keyWidth = viewport.w / row.length;
        const keyHeight = rowHeight * 0.9;

        return row.map((key, colIndex) => {
          const keyX = colIndex * keyWidth;
          return renderKey(key, keyX, rowY, keyWidth, keyHeight);
        });
      })}
    </pixiContainer>
  );
}
