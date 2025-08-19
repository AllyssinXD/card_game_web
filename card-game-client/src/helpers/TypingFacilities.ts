export function KeyToText(key: string, text: string) {
    if (key === "BACKSPACE") return text.slice(0, -1);
    return text + key 
}