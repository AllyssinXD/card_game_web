import { CanvasTextMetrics, TextStyle } from "pixi.js";
import type { TextProps } from "./Text";
import Text, { defaultTextStyle } from "./Text";
import { useState } from "react";

export interface ButtonProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text: TextProps;
  border?: string;
  hoverColor?: string;
  onClick?: () => void;
}

function Button({
  x,
  y,
  width,
  height,
  color,
  text,
  border,
  hoverColor,
  onClick,
}: ButtonProps) {
  const style = new TextStyle(
    text.style ? { ...defaultTextStyle, ...text.style } : defaultTextStyle
  );

  const [isHover, setIsHover] = useState(false);

  return (
    <pixiContainer
      interactive
      onPointerEnter={() => setIsHover(true)}
      onPointerLeave={() => setIsHover(false)}
      onPointerDown={onClick}
    >
      <pixiGraphics
        draw={(g) => {
          g.clear();
          g.fill(isHover ? hoverColor : color);
          border && g.setStrokeStyle({ width: 2, color: border });
          g.roundRect(x - width / 2, y - height / 2, width, height, 6);
          g.endFill();
        }}
        zIndex={0}
      />
      <Text x={x} y={y} {...text} zIndex={1} />
    </pixiContainer>
  );
}

export default Button;
