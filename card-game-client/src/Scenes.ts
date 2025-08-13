import Game from "./components/Game";
import Lobby from "./components/Lobby";
import MainMenu from "./components/MainMenu";

export const Scenes = {
    MainMenu,
    Lobby,
    Game
}

export type SceneKey = keyof typeof Scenes;