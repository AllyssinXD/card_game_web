import { useState, useEffect, useRef, type SetStateAction } from "react";
import { extend, useApplication } from "@pixi/react";
import {
  CanvasTextMetrics,
  Container,
  Graphics,
  Text,
  TextStyle,
} from "pixi.js";

extend({ Container, Text, Graphics });

export function PixiTextInput({
  x,
  y,
  width,
  height,
  text,
  setText,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  setText: React.Dispatch<SetStateAction<string>>;
}) {
  const [focused, setFocused] = useState(false);
  const { app } = useApplication();
  const inputBoxRef = useRef<Graphics>(null);

  // Captura teclado
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!focused) return;

      if (e.key === "Backspace") {
        setText((t) => t.slice(0, -1));
      } else if (e.key.length === 1) {
        setText((t) => t + e.key);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focused]);

  // Detecta clique para focar/desfocar
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!app) return;
      const rect = app.view.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calcular área considerando o centro como referência
      const left = x - width / 2;
      const right = x + width / 2;
      const top = y - height / 2;
      const bottom = y + height / 2;

      if (
        mouseX >= left &&
        mouseX <= right &&
        mouseY >= top &&
        mouseY <= bottom
      ) {
        setFocused(true);
      } else {
        setFocused(false);
      }
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [app.view, x, y, width, height]);

  return (
    <pixiContainer x={x} y={y}>
      {/* Caixa do input (centralizada) */}
      <pixiGraphics
        ref={inputBoxRef}
        draw={(g) => {
          g.clear();
          g.setStrokeStyle({ width: 2, color: focused ? 0x66ccff : 0x999999 });
          g.fill(0x222222);
          // Desenhar com centro no (0,0)
          g.roundRect(-width / 2, -height / 2, width, height, 6);
          g.endFill();
        }}
      />

      {/* Texto digitado */}
      <pixiText
        text={text || "Digite aqui..."}
        x={-width / 2 + 10} // desloca para começar um pouco à direita
        y={-height / 2 + 14} // centraliza verticalmente
        style={
          new TextStyle({
            fill: text ? "#ffffff" : "#888888",
            fontSize: 24,
            fontFamily: "'Jersey 10', sans serif",
          })
        }
      />

      {/* Cursor */}
      {focused && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            g.beginFill(0xffffff);
            const textWidth = CanvasTextMetrics.measureText(
              text,
              new TextStyle({
                fontFamily: "'Jersey 10', sans serif",
                fontSize: 24,
              })
            ).width;
            const cursorX = -width / 2 + 10 + textWidth;
            g.drawRect(cursorX, -height / 2 + 14, 2, 28);
            g.endFill();
          }}
        />
      )}
    </pixiContainer>
  );
}
