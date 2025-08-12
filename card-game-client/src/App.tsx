import { useState } from "react";
import "./App.css";
import Game from "./Game";

function App() {
  const [username, setUsername] = useState("");
  const [inGame, setInGame] = useState(false);

  return inGame ? (
    <Game username={username} />
  ) : (
    <>
      <input
        value={username}
        onChange={(e) => {
          setUsername(e.currentTarget.value);
        }}
      />
      <button onClick={() => setInGame(true)}>Entrar</button>
    </>
  );
}

export default App;
