import type { Container, ContainerChild } from "pixi.js";
import { useEffect, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import type { GameContextProps } from "../contexts/GameContext";
import type { SendingCard, ShowingCard } from "../components/Game";
import useViewport from "./useViewport";
import gsap from "gsap";
import type Card from "../types/Card";

export interface IdToRef {
    [id: string] : RefObject<Container<ContainerChild> | null>;
}

interface Coordinates {
    [id: string]: { x: number; y: number };
}

export interface useIGAProps {
    game: GameContextProps,
    refs: {
        playersHands: IdToRef;
    };
    sendingCardRef: RefObject<Container<ContainerChild> | null> ;
    setShowingLastCard: Dispatch<SetStateAction<ShowingCard | null>>
}

function useInGameAnimations({game, refs, sendingCardRef, setShowingLastCard}: useIGAProps) {

    const [coordinates, setCoordinates] = useState<Coordinates>({})

    useEffect(()=>{
        Object.keys(refs.playersHands).forEach(id=>{
            const ref = refs.playersHands[id]!
            if(!ref.current) return
            console.log(ref.current.getGlobalTransform())
            setCoordinates(prev => {
                prev![id] = {
                    x: ref.current!.getGlobalPosition().x,
                    y: ref.current!.getGlobalPosition().y,
                }
                return prev
            })
        })
    }, [refs.playersHands])

    const [sendingCard, setSendingCard] = useState<SendingCard | null>(null);
    const viewport = useViewport();

    useEffect(() => {
        if(!game.myId) return
        const pc = refs.playersHands[game.myId];
        const ac = refs.playersHands[game.gameState.players.find(p=>p.id!=game.myId)!.id];
        if (!pc || !ac) return; // garante que existe antes de animar
    
        if (game.gameState.turn === game.myId) {
          gsap.to(pc, {
            duration: 0.35,
            y: viewport.h - 120,
            ease: "power2.out",
          });
          gsap.to(ac, { duration: 0.35, rotation: 0 });
        } else {
          gsap.to(pc, {
            duration: 0.35,
            y: viewport.h - 100,
            ease: "power2.out",
          });
          gsap.to(ac, { duration: 0.35, rotation: 0 });
        }
      }, [game.gameState.turn, viewport.h]);

      useEffect(() => {
        if(!sendingCard) return;
        if (sendingCardRef.current && sendingCard) {
            const tl = gsap.timeline();
            if (
              sendingCard.desX == viewport.w / 2 &&
              sendingCard.desY == viewport.h / 2
            ) {
              tl.to(sendingCardRef.current.scale, {
                x: 1.5,
                y: 1.5,
                duration: 0.5,
                ease: "power2.inOut",
              }).to(
                sendingCardRef.current,
                {
                  x: sendingCard.desX,
                  y: sendingCard.desY,
                  duration: 0.5,
                  rotation: sendingCard.rotation,
                  ease: "power2.inOut",
                  onComplete: () => {
                    setShowingLastCard({
                      ...sendingCard.cardData,
                      angle: sendingCard.rotation, // mantém no estado
                    });
                    setSendingCard(null);
                  },
                },
                "<"
              );
              return;
            }
      
            tl.to(sendingCardRef.current, {
              x: sendingCard.desX,
              y: sendingCard.desY,
              duration: 0.5,
              rotation: sendingCard.rotation,
              ease: "power2.inOut",
              onComplete: () => {
                setSendingCard(null);
              },
            });
          }
        }, [sendingCard]);
    
        useEffect(() => {
            if (game.lastEvent.startsWith("BUYED_")) {
              const id = game.lastEvent.substring(6);
                const cords = coordinates[id]
                console.log(coordinates)
                const secretCard: Card = {
                  color: "UNKNOWN",
                  id: game.lastEvent,
                  num: "?",
                };
                setSendingCard({
                  cardData: secretCard,
                  color: secretCard.color,
                  num: secretCard.num,
                  rotation: 0,
                  originX: viewport.w / 2 - 120,
                  originY: viewport.h / 2,
                  desX: cords.x,
                  desY: cords.y,
                });
              }
        
            if (game.lastEvent.startsWith("PLAYED_")) {
              const params = game.lastEvent.split("_");
              const playerId = params[1];
        
              if (playerId != game.myId) {
                if (!game.gameState.lastCard) return;
                setSendingCard({
                  cardData: game.gameState.lastCard,
                  color: game.gameState.lastCard.color,
                  num: game.gameState.lastCard.num,
                  rotation: 0,
                  originX: viewport.w / 2 - 120,
                  originY: 100,
                  desX: viewport.w / 2,
                  desY: viewport.h / 2,
                });
              }
            }
          }, [game.lastEvent]);

    return {sendingCard, setSendingCard}
}

export default useInGameAnimations;