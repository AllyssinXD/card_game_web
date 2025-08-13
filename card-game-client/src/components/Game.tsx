import { useEffect, useMemo, useRef, useState } from "react";
import useGame from "../hooks/useGame";
import CardSprite from "./Card";
import Text from "./common/Text";
import type { Container } from "pixi.js";
import gsap from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import type Card from "../types/Card";
import useViewport from "../hooks/useViewport";
import useInGameAnimations, {
  type IdToRef,
  type useIGAProps,
} from "../hooks/useInGameAnimations";

// Registra o plugin do GSAP para propriedades do Pixi

gsap.registerPlugin(PixiPlugin);

export type ShowingCard = Card & { angle: number };
export type SendingCard = {
  originX: number;
  originY: number;
  desX: number;
  desY: number;
  color: Card["color"];
  num: string;
  cardData: Card;
  rotation: number;
};

function Game() {
  const game = useGame();
  const viewport = useViewport();

  // Se o hook ainda não retornou nada, evita render e erros
  if (!game || !game.gameState) return null;

  const { gameState, actions, myId } = game;

  // Índices/entidades derivadas com memo para evitar recomputo e estados redundantes
  const playerIndex = useMemo(
    () => gameState.players.findIndex((p) => p.id === myId),
    [gameState.players, myId]
  );

  // Assumindo jogo 1x1. Se for multiplayer, ajuste a lógica para escolher oponente(s).
  const adversary = useMemo(
    () => gameState.players.find((p) => p.id !== myId) ?? null,
    [gameState.players, myId]
  );
  const player = useMemo(
    () => gameState.players.find((p) => p.id == myId) ?? null,
    [gameState.players, myId]
  );

  const turnId = gameState.turn;
  const turnIndex = useMemo(
    () => gameState.players.findIndex((p) => p.id === turnId),
    [gameState.players, turnId]
  );

  // UI states
  const [adversaryHover, setAdversaryHover] = useState(false);
  const [playerCardSize] = useState(65);

  // Refs Pixi
  const adversaryContainer = useRef<Container | null>(null);
  const playerContainer = useRef<Container | null>(null);

  // Ajusta espaçamento conforme quantidade e largura disponível (encaixe responsivo)
  const cards = gameState.state.cards ?? [];
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

  const playersContainersRefs: IdToRef = {};
  playersContainersRefs[adversary!.id] = adversaryContainer;
  playersContainersRefs[player!.id] = playerContainer;

  // Segurança: evita acessar lastCard se inexistente
  const [lastCard, setLastCard] = useState<Card | null>(
    game.gameState.lastCard
  );
  const [showingLastCard, setShowingLastCard] = useState<ShowingCard | null>(
    lastCard ? { ...lastCard, angle: Math.random() * 60 - 30 } : null
  );

  // Segurança: impede jogar carta fora do turno
  const canPlay = turnIndex === playerIndex;

  // Quantidade “placeholder” para cartas do adversário quando não estiver em hover
  const visibleAdversaryCount = useMemo(() => {
    if (!adversary) return 0;
    const total = adversary.cardsLength ?? 0;
    return adversaryHover ? total : Math.min(3, total || 3); // mostra 3 por padrão
  }, [adversary, adversaryHover]);

  const cardsRefs = useRef<Record<string, Container | null>>({});
  const sendingCardRef = useRef<Container>(null);

  const IGAProps: useIGAProps = {
    game,
    refs: {
      playersHands: playersContainersRefs,
    },
    sendingCardRef,
    setShowingLastCard,
  };
  const { sendingCard, setSendingCard } = useInGameAnimations(IGAProps);

  useEffect(() => {
    if (game.gameState.lastCard) {
      setLastCard(game.gameState.lastCard);
    }
  }, [game.gameState.lastCard]);

  return (
    <>
      {/* Adversário */}
      <pixiContainer
        interactive
        onPointerEnter={() => setAdversaryHover(true)}
        onPointerLeave={() => setAdversaryHover(false)}
        ref={adversaryContainer}
        x={viewport.w / 2}
        y={100}
        anchor={0.5}
      >
        <pixiContainer
          x={
            adversaryContainer.current
              ? -(adversaryContainer.current.width / 2)
              : 0
          }
        >
          <Text
            text={adversary ? adversary.username : "Aguardando..."}
            y={-70}
            x={0}
          />
          {Array.from({ length: visibleAdversaryCount }).map((_, i, array) => {
            const isFirst = i === 0;
            const isLast = i === array.length - 1;
            const tilt = Math.PI * (turnId === adversary?.id ? 0.01 : -0.01);
            const rotation = isFirst ? -tilt : isLast ? tilt : 0;

            return (
              <pixiContainer key={`adv-${i}`} rotation={rotation}>
                <CardSprite
                  color={"UNKNOWN"}
                  num={"?"}
                  id={`adv-card-${i}`}
                  x={i * (65 - 30)}
                  y={0}
                  width={65}
                />
              </pixiContainer>
            );
          })}
        </pixiContainer>
      </pixiContainer>

      {/* Mesa (monte e compra) */}
      <pixiContainer x={viewport.w / 2} y={viewport.h / 2}>
        {!!lastCard && (
          <CardSprite
            color={showingLastCard!.color}
            num={showingLastCard!.num}
            id={showingLastCard!.id}
            x={0}
            y={0}
            rotation={showingLastCard?.angle ?? 0}
          />
        )}

        <pixiContainer
          interactive
          onPointerDown={() => {
            // Comprar carta é sempre permitido? Se não, valide aqui.
            actions?.buyCard?.();
          }}
        >
          <CardSprite
            color={"UNKNOWN"}
            num={"+"}
            id={"add"}
            x={-120}
            y={0}
            width={65}
          />
        </pixiContainer>
      </pixiContainer>

      {/* Mão do jogador */}
      <pixiContainer
        ref={playerContainer}
        y={viewport.h - 100}
        x={viewport.w / 2}
      >
        <pixiContainer
          x={playerContainer.current ? -(playerContainer.current.width / 2) : 0}
        >
          {cards.map((card, i) => {
            return (
              <pixiContainer
                ref={(el) => {
                  cardsRefs.current[card.id] = el;
                }}
                key={card.id ?? `card-${i}`}
                interactive
                // Evita ações fora do turno
                onPointerDown={() => {
                  if (!canPlay) return;
                  if (!card?.id) return;

                  try {
                    actions?.playCard?.(card.id);
                  } catch (e) {
                    console.error("Falha ao jogar carta:", e);
                  }

                  if (
                    card.num == showingLastCard?.num ||
                    card.color == showingLastCard?.color
                  ) {
                    setSendingCard({
                      desX: viewport.w / 2,
                      desY: viewport.h / 2,
                      originX:
                        cardsRefs.current[card.id]!.getGlobalPosition().x,
                      originY: viewport.h - 100,
                      color: card.color,
                      num: card.num,
                      cardData: card,
                      rotation: (Math.random() * 30 - 15) * (Math.PI / 180), // já salva aqui
                    });
                  }
                }}
                alpha={canPlay ? 1 : 0.6}
                x={i * marginCard}
              >
                <CardSprite
                  x={0}
                  y={0}
                  width={playerCardSize}
                  color={card.color}
                  num={card.num}
                  id={card.id}
                />
              </pixiContainer>
            );
          })}
          <Text text="Você" y={70} x={0} />
        </pixiContainer>
      </pixiContainer>
      {sendingCard && (
        <pixiContainer
          ref={sendingCardRef}
          x={sendingCard.originX}
          y={sendingCard.originY}
          zIndex={5}
        >
          <CardSprite
            color={sendingCard.color}
            num={sendingCard.num}
            id="aaa"
            x={0}
            y={0}
            width={65}
          />
        </pixiContainer>
      )}
    </>
  );
}

export default Game;
