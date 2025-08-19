import { useEffect, useMemo, useState } from "react";
import type { Player } from "../types/Player";
import CardSprite from "./Card";
import useViewport from "../hooks/useViewport";
import useVisualState from "../hooks/useVisualState";
import Text from "./common/Text";

function PlayerHand({
  player,
  isOfPlayer,
  location,
}: {
  player: Player;
  isOfPlayer: boolean;
  location: string;
}) {
  const viewport = useViewport();
  const visualState = useVisualState();
  if (!player || !visualState || visualState.cards == undefined) return;

  // Ajusta espaçamento conforme quantidade e largura disponível (encaixe responsivo)
  const playerCardSize = 50;
  const cardHeight = playerCardSize * 1.4; // altura da carta

  const [handMaxWidth, setHandMaxWidth] = useState(viewport.w * 0.3); // largura máxima que as cartas podem ocupar

  const calcMarginCard = useMemo(() => {
    const n = player.cardsLength ?? 0;
    if (n <= 1) return 0;

    let gap = Math.min((handMaxWidth - n * playerCardSize) / (n - 1), 20); // pode ser negativo se não couber
    // piso opcional de sobreposição (evita sumir demais)
    // ex.: não deixar sobrepor mais do que 80% da largura da carta

    return gap;
  }, [player.cardsLength, handMaxWidth, playerCardSize]);

  const [marginCard, setMarginCard] = useState(calcMarginCard); // espaçamento entre as cartas, limitado a 20px

  if (!player) return <></>;

  useEffect(() => {
    // Atualiza a largura máxima da mão do jogador
    setHandMaxWidth(viewport.w * 0.3);
    // Atualiza o espaçamento entre as cartas
    setMarginCard(calcMarginCard);
  }, [viewport.w, player.cardsLength, visualState.cards]);

  return (
    <pixiContainer
      rotation={
        location === "left"
          ? Math.PI / 2
          : location === "right"
          ? Math.PI / -2
          : 0
      }
      ref={(el) => {
        if (!el) return;
        if (!visualState.playersRefs[player.id])
          visualState.setPlayerContainer(player.id, el);
      }}
    >
      <pixiGraphics
        draw={(g) => {
          g.clear();
          g.setStrokeStyle({
            width: 2,
            color: 0x999999,
          });
          g.fill(0x222222);
          g.roundRect(
            -handMaxWidth / 2,
            -(cardHeight + 30) / 2,
            handMaxWidth,
            cardHeight + 30,
            10
          );
          g.endFill();
        }}
        zIndex={0}
      />
      {/*Player Username*/}
      <Text
        text={player.username}
        x={0}
        y={-cardHeight / 2 - 10}
        anchor={0.5}
        size={24}
        style={{ fill: "#ffffff" }}
        zIndex={4}
      />
      {!isOfPlayer
        ? Array.from({ length: player.cardsLength }).map((_, i) => {
            const x =
              i * (playerCardSize + marginCard) -
              ((player.cardsLength - 1) * (playerCardSize + marginCard)) / 2;
            //Ficar embaixo do nome do jogador
            const y = 10;
            const key = player.id + "_CARD_" + i;

            return (
              <pixiContainer
                ref={(el) => {
                  if (!el) return;
                  const params = {
                    message: "RENDERING " + key,
                    cardRegistered: visualState.cards[key],
                    element: el,
                    elementIsLikeBefore: visualState.cards[key] == el,
                    alreadyIncluesKey: !!visualState.cards[key],
                  };

                  // Evita update se o valor não mudou
                  if (!params.alreadyIncluesKey) {
                    visualState.setCard(key, el);
                  }
                }}
              >
                <CardSprite
                  color={"UNKNOWN"}
                  num={"?"}
                  id={player.id + "_CARD_" + i}
                  x={x}
                  y={y}
                  width={playerCardSize}
                />
              </pixiContainer>
            );
          })
        : visualState!.showingPlayerCards.map((card, i) => {
            const x =
              i * (playerCardSize + marginCard) -
              ((player.cardsLength - 1) * (playerCardSize + marginCard)) / 2;
            //Ficar embaixo do nome do jogador
            const y = 10;
            const key = player.id + "_CARD_" + card.id;

            return (
              <pixiContainer
                ref={(el) => {
                  if (!el) return;
                  const params = {
                    message: "RENDERING " + key,
                    cardRegistered: visualState.cards[key],
                    element: el,
                    elementIsLikeBefore: visualState.cards[key] == el,
                    alreadyIncluesKey: !!visualState.cards[key],
                  };

                  // Evita update se o valor não mudou
                  if (
                    !params.alreadyIncluesKey &&
                    !params.elementIsLikeBefore
                  ) {
                    visualState.setCard(key, el);
                  }
                }}
                key={key}
              >
                <CardSprite
                  key={card.id}
                  color={card.color}
                  num={card.num}
                  id={key}
                  x={x}
                  y={y}
                  width={playerCardSize}
                />
              </pixiContainer>
            );
          })}
    </pixiContainer>
  );
}

export default PlayerHand;
