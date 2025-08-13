import useGame from "../hooks/useGame";
import Button from "./common/Button";
import Text from "./common/Text";

function Lobby() {
  const game = useGame();

  return game?.isInGame ? (
    <pixiContainer>
      <Text text="Lobby" size={76} x={window.innerWidth / 2} y={30} />
      <pixiContainer x={window.innerWidth / 2} y={100}>
        <pixiGraphics
          draw={(g) => {
            g.clear();
            g.fill("#4A2C2A");
            g.setStrokeStyle({ width: 2, color: "#DEB887" });
            g.roundRect(-300 / 2, 0, 300, 400, 6);
            g.endFill();
          }}
          zIndex={0}
        />
        {game.gameState.players.map((player, i) => {
          return <Text text={player.username} x={0} y={30 + 30 * i} />;
        })}
        <Button
          x={0}
          y={450}
          text={{ text: "Sair" }}
          width={200}
          height={50}
          color="#7a0909ff"
          border="#160101ff"
          hoverColor="#b10000ff"
          onClick={() => {
            game.setScene("MainMenu");
          }}
        />
        {game.gameState.players[0].id == game.myId && (
          <Button
            x={0}
            y={510}
            text={{ text: "Iniciar Jogo" }}
            width={200}
            height={50}
            color="#0d7a25ff"
            border="rgba(1, 218, 37, 1)"
            hoverColor="#70ff88ff"
            onClick={() => {
              game.actions.start();
            }}
          />
        )}
      </pixiContainer>
    </pixiContainer>
  ) : (
    <></>
  );
}

export default Lobby;
