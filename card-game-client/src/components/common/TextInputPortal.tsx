import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import ReactDOM from "react-dom";

interface PixiTextInputPortalProps {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  focused: boolean;
  setFocused: Dispatch<SetStateAction<boolean>>;
}

export function PixiTextInputPortal({
  x,
  y,
  width,
  height,
  text,
  setText,
  focused,
  setFocused,
}: PixiTextInputPortalProps) {
  const [inputPos, setInputPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setInputPos({
      left: rect.left + x - width / 2,
      top: rect.top + y - height / 2,
    });
  }, [x, y, width, height]);

  if (!focused) return null;

  return ReactDOM.createPortal(
    <input
      autoFocus
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => setFocused(false)}
      style={{
        position: "absolute",
        left: inputPos.left,
        top: inputPos.top,
        width,
        height,
        fontSize: 24,
        background: "transparent",
        border: "none",
        outline: "none",
        color: "#fff",
        caretColor: "#fff",
        opacity: 0.01,
        WebkitAppearance: "none",
      }}
    />,
    document.body
  );
}
