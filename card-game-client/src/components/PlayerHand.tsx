import {
  useMemo,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import type { Player } from "../types/Player";
import CardSprite from "./Card";
import useViewport from "../hooks/useViewport";
import type { Container, ContainerChild } from "pixi.js";

function PlayerHand({
  player,
  cardRefs,
  position,
}: {
  player: Player;
  cardRefs: RefObject<
    Record<string, RefObject<Container<ContainerChild> | null>>
  >;
  position: "top" | "bottom" | "left" | "right";
}) {
  console.log(player, cardRefs);
  if (!player || cardRefs == undefined) return;
  const viewport = useViewport();
  // Ajusta espaçamento conforme quantidade e largura disponível (encaixe responsivo)
  const cards = Array.from({ length: player.cardsLength }) ?? [];
  const playerCardSize = 50;
  const marginCard = useMemo(() => {
    const n = Math.max(1, cards.length);
    const paddingHorizontal = 200; // margem para não encostar nas bordas
    const track = Math.max(240, viewport.w - paddingHorizontal); // largura útil mínima
    // Espaço disponível entre os centros: (track - larguraPrimeiraCarta) / (n - 1)
    const maxSpacing = Math.floor(
      (track - playerCardSize) / Math.max(1, n - 1)
    );
    // Mantém limites razoáveis para não ficar colado nem distante demais
    return Math.max(
      playerCardSize - 50,
      Math.min(playerCardSize + 5, maxSpacing)
    );
  }, [cards.length, playerCardSize, viewport.w]);
  return (
    <pixiContainer>
      {Array.from({ length: player.cardsLength }).map((_, i) => {
        return (
          <pixiContainer
            ref={(el) => {
              cardRefs.current[player.id + "_CARD_" + i] = { current: el };
            }}
          >
            <CardSprite
              color="UNKNOWN"
              num="?"
              id={player.username + "_" + i}
              x={marginCard * i}
              y={0}
              width={playerCardSize}
            />
          </pixiContainer>
        );
      })}
    </pixiContainer>
  );
}

export default PlayerHand;
