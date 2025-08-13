import { Text as PixiText, type TextStyle } from "pixi.js";
import type { Ref } from "react";

export interface TextProps {
  text: string;
  size?: number;
  pixiRef?: Ref<PixiText>;
  style?: Partial<TextStyle>;
  x?: number;
  y?: number;
  [key: string]: any; // para permitir props extras do Pixi
}

export const defaultTextStyle = {
  fontSize: 24,
  align: "center",
  fill: "#fff",
  fontFamily: "'Jersey 10', sans-serif",
} as TextStyle;

function Text({ text, pixiRef, size, style, ...rest }: TextProps) {
  return (
    <pixiText
      ref={pixiRef}
      text={text}
      style={{
        ...defaultTextStyle,
        ...style,
      }}
      {...rest}
    />
  );
}

export default Text;
