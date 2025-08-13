import { useEffect, useState } from "react";

function useViewport() {
    const [viewport, setViewport] = useState({
        w: window.innerWidth,
        h: window.innerHeight,
      });

    useEffect(() => {
        const onResize = () =>
        setViewport({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    return viewport;
}

export default useViewport;