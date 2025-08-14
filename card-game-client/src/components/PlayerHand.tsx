import { useEffect, useMemo } from "react";
import type { Player } from "../types/Player";
import CardSprite from "./Card";
import useViewport from "../hooks/useViewport";
import useVisualState from "../hooks/useVisualState";

function PlayerHand({
  player,
  isOfPlayer,
}: {
  player: Player;
  isOfPlayer: boolean;
}) {
  const viewport = useViewport();
  const visualState = useVisualState();
  if (!player || !visualState || visualState.cards == undefined) return;

  // Ajusta espaçamento conforme quantidade e largura disponível (encaixe responsivo)
  const cards = Array.from({ length: player.cardsLength }) ?? [];
  const playerCardSize = 50;
  const marginCard = useMemo(() => {
    const n = Math.max(1, cards.length);
    const paddingHorizontal = 200; // margem lateral
    const maxTrackWidth = 600; // largura máxima que as cartas podem ocupar

    // faixa horizontal útil limitada ao máximo permitido
    const track = Math.min(
      maxTrackWidth,
      Math.max(240, viewport.w - paddingHorizontal)
    );

    // Espaço disponível entre centros
    const maxSpacing = Math.floor(
      (track - playerCardSize) / Math.max(1, n - 1)
    );

    // Mantém limites mínimos e máximos do espaçamento
    return Math.max(
      playerCardSize - 50, // limite mínimo
      Math.min(
        playerCardSize + 5, // limite máximo
        maxSpacing
      )
    );
  }, [cards.length, playerCardSize, viewport.w]);

  return (
    <pixiContainer>
      {!isOfPlayer &&
        Array.from({ length: player.cardsLength }).map((_, i) => {
          return (
            <pixiContainer
              ref={(el) => {
                const key = player.id + "_CARD_" + i;

                console.log("RENDERING " + key);

                // Evita update se o valor não mudou
                if (!Object.keys(visualState.cards).includes(key)) {
                  visualState.setCard(key, el);
                }
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
      {isOfPlayer &&
        visualState!.showingPlayerCards.map((card, i) => {
          return (
            <pixiContainer
              ref={(el) => {
                const key = player.id + "_CARD_" + card.id;

                if (!el) return;
                const params = {
                  message: "RENDERING " + key,
                  cardRegistered: visualState.cards[key],
                  element: el,
                  elementIsLikeBefore: visualState.cards[key] == el,
                  alreadyIncluesKey: !!visualState.cards[key],
                };

                console.log(params);

                // Evita update se o valor não mudou
                if (!params.alreadyIncluesKey) {
                  visualState.setCard(key, el);
                }
              }}
              key={player.id + "_CARD_" + card.id}
            >
              <CardSprite
                color={card.color}
                num={card.num}
                id={player.username + "_" + card.id}
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
