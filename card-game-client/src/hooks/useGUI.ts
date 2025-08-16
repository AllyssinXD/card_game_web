import { useContext } from "react";
import { GUIContext } from "../contexts/GUIContext";

function useGUI() {
    return useContext(GUIContext);
}

export default useGUI;