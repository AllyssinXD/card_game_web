import Lobby from "./components/Game";
import MainMenu from "./components/MainMenu";

export const Scenes = {
    MainMenu,
    Lobby
}

export type SceneKey = keyof typeof Scenes;