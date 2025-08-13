import type Card from "../types/Card";
import Text from "./common/Text";

interface CardProps extends Card {
  width?: number;
  x: number;
  y: number;
  rotation?: number;
}

function CardSprite({
  x,
  y,
  color,
  num,
  width = 100,
  rotation = 0,
}: CardProps) {
  const getHexaColor = (color: Card["color"]): string => {
    switch (color) {
      case "BLUE":
        return "#1e3a8a"; // azul mais vivo
      case "GREEN":
        return "#10b981"; // verde mais vivo
      case "YELLOW":
        return "#facc15"; // amarelo
      case "RED":
        return "#ef4444"; // vermelho
      case "UNKNOWN":
        return "#525252"; // cinza neutro
    }
  };

  const height = width * 1.4;

  return (
    <pixiContainer x={x} y={y} rotation={rotation}>
      {/* Sombra da carta */}
      <pixiGraphics
        draw={(g) => {
          g.clear();
          g.beginFill(0x000000, 0.2); // sombra preta translúcida
          g.drawRoundedRect(-width / 2 + 3, -height / 2 + 3, width, height, 6);
          g.endFill();
        }}
      />
      {/* Carta principal */}
      <pixiGraphics
        draw={(g) => {
          g.clear();
          g.beginFill(parseInt(getHexaColor(color).slice(1), 16));
          g.lineStyle(4, 0x333333); // borda escura
          g.drawRoundedRect(-width / 2, -height / 2, width, height, 8);
          g.endFill();
        }}
      />
      {/* Número no canto superior esquerdo */}
      <Text
        text={num}
        size={width * 0.2}
        x={-width / 2 + width * 0.15}
        y={-height / 2 + width * 0.1}
      />
      <Text text={num} size={(65 / 100) * width} x={0} y={0} />
      {/* Número no canto inferior direito (espelhado) */}
      <Text
        text={num}
        size={width * 0.2}
        x={width / 2 - width * 0.15}
        y={height / 2 - width * 0.2}
        anchor={{ x: 1, y: 1 }}
      />
    </pixiContainer>
  );
}

export default CardSprite;
