import { useState, useEffect, useRef, type SetStateAction } from "react";
import { extend, useApplication } from "@pixi/react";
import {
  CanvasTextMetrics,
  Container,
  Graphics,
  Text,
  TextStyle,
} from "pixi.js";
import { PixiTextInputPortal } from "./TextInputPortal";

extend({ Container, Graphics, Text });

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
  const inputRef = useRef<HTMLInputElement>(null);

  // Centraliza a posição do input HTML na tela (considerando canvas offset)
  const [inputPos, setInputPos] = useState({ left: 0, top: 0 });

  // Ao focar no Pixi, mostra e posiciona o input HTML e foca nele
  function handleFocus() {
    if (!app) return;
    const rect = app.view.getBoundingClientRect();

    setInputPos({
      left: rect.left + x - width / 2,
      top: rect.top + y - height / 2,
    });

    setFocused(true);

    // Deixa o input focado na próxima vez que for renderizado
    setTimeout(() => inputRef.current?.focus(), 10);
  }

  // Sincroniza texto do input com estado
  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
  }

  // Ao desfocar input HTML, oculta ele também no Pixi
  function onBlur() {
    setFocused(false);
  }

  // Captura clique na área Pixi para focar o input
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!app) return;
      const rect = app.view.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

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
        handleFocus();
      } else {
        setFocused(false);
      }
    }

    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [app.view, x, y, width, height]);

  return (
    <>
      <pixiContainer x={x} y={y}>
        {/* Caixa do input (centralizada) */}
        <pixiGraphics
          ref={inputBoxRef}
          draw={(g) => {
            g.clear();
            g.lineStyle(2, focused ? 0x66ccff : 0x999999);
            g.beginFill(0x222222);
            g.drawRoundedRect(-width / 2, -height / 2, width, height, 6);
            g.endFill();
          }}
        />

        {/* Texto digitado */}
        <pixiText
          text={text || "Digite aqui..."}
          x={-width / 2 + 10}
          y={-height / 2 + 14}
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
      {/* Input HTML fora do Pixi via portal */}
      <PixiTextInputPortal
        x={x}
        y={y}
        width={width}
        height={height}
        text={text}
        setText={setText}
        focused={focused}
        setFocused={setFocused}
      />
    </>
  );
}
