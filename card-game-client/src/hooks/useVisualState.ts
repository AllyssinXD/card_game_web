import { useContext } from "react";
import { VisualStateContext } from "../contexts/VisualStateContext";

function useVisualState() {
    return useContext(VisualStateContext);
}

export default useVisualState;