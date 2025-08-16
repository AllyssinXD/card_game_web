import { useEffect, useState } from "react";
import useGame from "../hooks/useGame";
import useViewport from "../hooks/useViewport";
import Button from "./common/Button";
import Text from "./common/Text";

function Lobby() {
  const game = useGame();
  const viewport = useViewport();

  const [mobileScreen, setMobileScreen] = useState(viewport.w < 1000);

  useEffect(() => {
    setMobileScreen(viewport.w < 1000);
  }, [viewport.h, viewport.w]);

  if (!game?.isInGame) return null;

  const [panelWidth, setPanelWidth] = useState(
    mobileScreen ? viewport.w * 0.8 : viewport.w * 0.4
  );
  const [panelHeight, setPanelHeight] = useState(
    mobileScreen ? viewport.h * 0.7 : 400
  );
  const [buttonWidth, setButtonWidth] = useState(
    mobileScreen ? panelWidth * 0.6 : 200
  );
  const [buttonHeight, setButtonHeight] = useState(50);

  useEffect(() => {
    setPanelWidth(mobileScreen ? viewport.w * 0.8 : viewport.w * 0.4);
    setPanelHeight(mobileScreen ? viewport.h * 0.7 : viewport.h * 0.8);
    setButtonWidth(mobileScreen ? panelWidth / 2 - 20 : 200);
    setButtonHeight(50);
  }, [mobileScreen, viewport.w, viewport.h]);

  const spacing = 30;

  if (game.isInGame && !game.wsLastMsg) {
    return (
      <Text
        text="Tentando conexão com o servidor..."
        size={Math.min(50, viewport.w * 0.06)}
        x={viewport.w / 2}
        y={viewport.h / 2}
        anchor={0.5}
      />
    );
  }

  return (
    <>
      {/* Título */}
      <Text
        text="Lobby"
        size={Math.min(76, viewport.w * 0.06)}
        x={viewport.w / 2}
        y={50}
        anchor={0.5}
      />
      <pixiContainer x={viewport.w / 2} y={viewport.h / 2 + 30}>
        <pixiGraphics
          draw={(g) => {
            g.clear();
            g.fill(0x000000, 0);
            g.rect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight);
            g.endFill();
          }}
          zIndex={0}
        />
        <pixiContainer x={0} y={0}>
          {/* Painel de fundo */}
          <pixiGraphics
            draw={(g) => {
              g.clear();
              g.fill("#4A2C2A");
              g.setStrokeStyle({ width: 2, color: "#DEB887" });
              g.roundRect(
                -panelWidth / 2,
                -panelHeight / 2,
                panelWidth / 2,
                panelHeight,
                6
              );
              g.endFill();
            }}
            zIndex={0}
          />

          {/* Layout horizontal */}
          <pixiContainer x={-panelWidth / 2 + 10} y={-panelHeight / 2 + 10}>
            {/* Lista de jogadores à esquerda */}
            <Text text={"Jogadores :"} x={0} y={0} anchor={0} size={30} />
            <pixiContainer y={40}>
              {game.gameState.players.map((player, i) => (
                <Text
                  key={player.id}
                  text={player.username}
                  x={0}
                  y={i * spacing}
                  anchor={0}
                />
              ))}
            </pixiContainer>
          </pixiContainer>

          <pixiContainer x={panelWidth / 2} y={-panelHeight / 2}>
            {/* Botões à direita */}
            <Button
              x={-buttonWidth / 2}
              y={buttonHeight / 2}
              width={buttonWidth}
              height={buttonHeight}
              text={{ text: "Sair" }}
              color="#7a0909ff"
              border="#160101ff"
              hoverColor="#b10000ff"
              onClick={() => game.setScene("MainMenu")}
            />
            {game.gameState.players[0].id === game.myId && (
              <Button
                x={-buttonWidth / 2}
                y={buttonHeight * 1.5 + 10}
                width={buttonWidth}
                height={buttonHeight}
                text={{ text: "Iniciar Jogo" }}
                color="#0d7a25ff"
                border="rgba(1, 218, 37, 1)"
                hoverColor="#70ff88ff"
                onClick={() => game.actions.start()}
              />
            )}
          </pixiContainer>
        </pixiContainer>
      </pixiContainer>
    </>
  );
}

export default Lobby;
