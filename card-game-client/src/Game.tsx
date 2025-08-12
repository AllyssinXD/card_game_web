import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";

interface Players {
  username: string;
  cardsLength: number;
  id: string;
  isTyping: boolean;
}

interface Card {
  id: string;
  color: string;
  num: string;
}

function Game({ username }: { username: string }) {
  console.log(import.meta.env.VITE_API_URL);
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(
    import.meta.env.VITE_API_URL,
    { queryParams: { username } }
  );

  const [myId, setMyId] = useState("");
  const [players, setPlayers] = useState<Players[]>([]);
  const [gameState, setGameState] = useState<"WAITING_PLAYERS" | "GOING">(
    "WAITING_PLAYERS"
  );
  const [myCards, setMyCards] = useState<Card[]>([]);
  const [lastCard, setLastCard] = useState<Card | null>(null);
  const [message, setMessage] = useState<string | null>();

  useEffect(() => {
    if (lastJsonMessage) {
      const res = lastJsonMessage as any;
      console.log(res);
      if ("yourId" in res) setMyId(res.yourId);

      if ("event" in res) {
        if (res.event == "PLAYER_ENTERED") {
          setPlayers(res.players as Players[]);
          setGameState(res.gameState);
        }
        if (res.event == "END_GAME") {
          setMessage("Jogador " + res.winner + " ganhou o jogo");
          setTimeout(() => {
            setMessage(null);
            setGameState(res.gameState);
          }, 5000);
        }
      } else if ("gameState" in res) setGameState(res.gameState);
      if ("players" in res) setPlayers(res.players);
      if ("lastCard" in res) setLastCard(res.lastCard);
      if ("state" in res) setMyCards(res.state.cards);
    }
  }, [lastJsonMessage]);

  if (gameState === "WAITING_PLAYERS") {
    return (
      <div className="lobby">
        <div>seu id : {myId}</div>
        <div>
          <h2>Outros jogadores:</h2>
          <ul>
            {players.map((player) => (
              <li key={player.id}>
                <span>{player.username}</span>
              </li>
            ))}
          </ul>
          {players.length > 0 && players[0].id === myId && (
            <button onClick={() => sendJsonMessage({ action: "START_GAME" })}>
              Começar Jogo
            </button>
          )}
        </div>
      </div>
    );
  }

  // 🔹 Ordenar jogadores de forma que você esteja sempre na posição 0
  const myIndex = players.findIndex((p) => p.id === myId);
  const orderedPlayers = [
    ...players.slice(myIndex),
    ...players.slice(0, myIndex),
  ];

  const opponents = orderedPlayers.slice(1); // todos menos você

  return (
    <div className={`game-layout players-${players.length}`}>
      {message && <div className="message">{message}</div>}
      {/* Topo */}
      {players.length === 2 && (
        <div className="opponent top">
          {opponents[0]?.username} ({opponents[0]?.cardsLength} cartas)
        </div>
      )}
      {players.length === 4 && (
        <div className="opponent top">
          {opponents[1]?.username} ({opponents[1]?.cardsLength} cartas)
        </div>
      )}

      {/* Esquerda */}
      {(players.length === 3 || players.length === 4) && (
        <div className="opponent left">
          {opponents[0]?.username} ({opponents[0]?.cardsLength} cartas)
        </div>
      )}

      {/* Centro - Última carta */}
      <div className="table-center">
        <div
          className="card buyCards"
          onClick={() => {
            sendJsonMessage({ action: "BUY" });
          }}
        >
          +
        </div>
        {lastCard && (
          <div className={`card ${lastCard.color}`}>{lastCard.num}</div>
        )}
      </div>

      {/* Direita */}
      {players.length >= 3 && (
        <div className="opponent right">
          {players.length === 3
            ? opponents[1]?.username
            : opponents[2]?.username}{" "}
          (
          {players.length === 3
            ? opponents[1]?.cardsLength
            : opponents[2]?.cardsLength}{" "}
          cartas)
        </div>
      )}

      {/* Você */}
      <div className="me">
        <div className="hand">
          {myCards.map((card) => (
            <div
              key={card.id}
              className={`card ${card.color}`}
              onClick={() => sendJsonMessage({ action: "PLAY_" + card.id })}
            >
              {card.num}
            </div>
          ))}
        </div>
        <span>{orderedPlayers[0]?.username} (Você)</span>
      </div>
    </div>
  );
}

export default Game;
