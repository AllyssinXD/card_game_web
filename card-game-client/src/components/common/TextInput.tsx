import { useState, useEffect, useRef, type SetStateAction } from "react";
import { extend, useApplication } from "@pixi/react";
import {
  CanvasTextMetrics,
  Container,
  Graphics,
  Rectangle,
  Text,
  TextStyle,
} from "pixi.js";
import { KeyToText } from "../../helpers/TypingFacilities";
import useGUI from "../../hooks/useGUI";
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
  const gui = useGUI();
  const inputBoxRef = useRef<Graphics>(null);

  if (!app) return;

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

  useEffect(() => {
    if (!gui || !inputBoxRef.current) return;
    console.log(gui?.focusId);
    if (gui.focusId == inputBoxRef.current.uid) {
      setFocused(true);
      gui.setTypingText(text);
    } else setFocused(false);
  }, [gui?.focusId]);

  useEffect(() => {
    if (!gui) return;
    if (!gui.focusId) return;
    if (!focused) return;
    if (!gui.lastKey) return;

    setText((prev) => KeyToText(gui.lastKey!.key, prev));
  }, [gui?.lastKey]);

  // Detecta clique para focar/desfocar

  return (
    <pixiContainer x={x} y={y}>
      <pixiGraphics
        draw={(g) => {
          g.clear();
          g.setStrokeStyle({ width: 1 });
          g.fill(0xff0000, 0.4);
          g.rect(-width / 2, -height / 2, width, height);
          g.endFill();
        }}
        hitArea={new Rectangle(-width / 2, -height / 2, width, height)}
        zIndex={1}
        interactive
        eventMode="static"
        onPointerDown={() => {
          gui?.setFocusId(inputBoxRef.current!.uid);
        }}
      >
        {/* Caixa do input (centralizada) */}
        <pixiGraphics
          ref={inputBoxRef}
          draw={(g) => {
            g.clear();
            g.setStrokeStyle({
              width: 2,
              color: focused ? 0x66ccff : 0x999999,
            });
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
      </pixiGraphics>
    </pixiContainer>
  );
}
