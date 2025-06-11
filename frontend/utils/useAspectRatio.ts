import { useEffect, useRef, useState } from "react";

export function useAspectRatio(aspectRatio = 4 / 3) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const { clientWidth: w, clientHeight: h } = el;
      const containerRatio = w / h;

      if (containerRatio > aspectRatio) {
        // too wide — constrain by height
        setSize({ width: h * aspectRatio, height: h });
      } else {
        // too tall — constrain by width
        setSize({ width: w, height: w / aspectRatio });
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspectRatio]);

  return { containerRef, ...size };
}
