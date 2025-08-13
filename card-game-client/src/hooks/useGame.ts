import { useContext } from "react";
import { GameContext } from "../contexts/GameContext";

function useGame() {
    return useContext(GameContext);
}

export default useGame;