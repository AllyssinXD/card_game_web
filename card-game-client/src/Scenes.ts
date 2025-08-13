import Lobby from "./components/Lobby";
import MainMenu from "./components/MainMenu";

export const Scenes = {
    MainMenu,
    Lobby
}

export type SceneKey = keyof typeof Scenes;