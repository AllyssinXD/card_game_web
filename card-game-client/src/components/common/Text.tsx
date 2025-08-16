import { Text as PixiText, TextStyle } from "pixi.js";
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
  let textStyle = { ...style, ...defaultTextStyle };
  if (size) textStyle.fontSize = size;
  if (style?.align) textStyle.align = style.align;
  return (
    <pixiText
      anchor={0.5}
      ref={pixiRef}
      text={text}
      style={textStyle}
      {...rest}
    />
  );
}

export default Text;
