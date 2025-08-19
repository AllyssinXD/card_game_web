import { extend } from "@pixi/react";
import gsap from "gsap";
import PixiPlugin from "gsap/PixiPlugin";
import { Container, Text as PixiText } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import { PixiTextInput } from "./common/TextInput";
import Text from "./common/Text";
import Button from "./common/Button";
import useGame from "../hooks/useGame";
import useViewport from "../hooks/useViewport";

gsap.registerPlugin(PixiPlugin);
extend({ Container, PixiText });
function MainMenu() {
  const game = useGame();
  const viewport = useViewport();
  const mainTitleRef = useRef<PixiText>(null);
  const optionsRef = useRef<Container>(null);
  const [username, setUsername] = useState("");

  const joinGame = () => {
    game?.setUsername(username);
    game?.setScene("Lobby");
  };

  useEffect(() => {
    if (mainTitleRef.current) {
      const tl = gsap.timeline();
      tl.to(mainTitleRef.current, {
        alpha: 1,
        duration: 2,
      })
        .to(
          mainTitleRef.current.scale,
          {
            x: 1,
            y: 1,
            duration: 2,
          },
          "<"
        )
        .to(mainTitleRef.current.scale, {
          x: 1.2,
          y: 1.2,
          duration: 2,
          yoyo: true,
          repeat: -1,
          ease: "power1.inOut",
        })
        .from(
          mainTitleRef.current,
          {
            y: viewport.h / 2,
            duration: 2,
            ease: "power1.inOut",
          },
          "<"
        )
        .to(optionsRef.current, {
          alpha: 1,
          duration: 0.5,
        });
    }
  }, []);

  return (
    <>
      <pixiContainer x={Math.round(window.innerWidth / 2)} y={0}>
        <pixiText
          ref={mainTitleRef}
          text={"Descartez"}
          alpha={0}
          scale={{ x: 0, y: 0 }}
          x={0}
          y={viewport.h / 4}
          anchor={0.5}
          style={{
            fontSize: viewport.w > 1000 ? 96 : viewport.w > 800 ? 86 : 70,
            align: "center",
            fill: "#fff",
            fontFamily: "'Jersey 10', sans serif",
          }}
        />
      </pixiContainer>
      <pixiContainer
        ref={optionsRef}
        x={Math.round(window.innerWidth / 2)} // centro da tela
        y={Math.round(window.innerHeight / 2)} // centro da tela
        anchor={0.5}
        alpha={0}
      >
        <Text text="Insira um apelido :" x={0} y={0} anchor={0.5} />
        <PixiTextInput
          x={0}
          y={50}
          width={viewport.w > 1000 ? 400 : viewport.w > 800 ? 360 : 300}
          height={50}
          text={username}
          setText={setUsername}
        />
        <Button
          onClick={joinGame}
          x={0}
          y={120}
          width={200}
          height={50}
          color="#124213ff"
          hoverColor="#0e9110ff"
          text={{ text: "JOGAR", style: { fill: "#FFFFFF" } }}
          border="#FFFFFF"
        />
      </pixiContainer>
    </>
  );
}

export default MainMenu;
