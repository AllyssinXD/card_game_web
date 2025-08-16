import type { TextProps } from "./Text";
import Text from "./Text";
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
  const [isHover, setIsHover] = useState(false);

  return (
    <pixiContainer
      interactive
      onPointerEnter={() => setIsHover(true)}
      onPointerLeave={() => setIsHover(false)}
      onPointerDown={onClick}
      x={x}
      y={y}
    >
      <pixiGraphics
        draw={(g) => {
          g.clear();
          g.fill(isHover ? hoverColor : color);
          border && g.setStrokeStyle({ width: 2, color: border });
          g.roundRect(-width / 2, -height / 2, width, height, 6);
          g.endFill();
        }}
        zIndex={0}
      />
      <Text x={0} y={0} {...{ ...{ anchor: 0.5 }, ...text }} zIndex={1} />
    </pixiContainer>
  );
}

export default Button;
