"use client";

import { DrawingLine } from "@/components/DrawingLine";
import { useEffect, useRef, useState } from "react";

export type Point = {
  x: number;
  y: number;
};

export type Line = Point[];

const VIEWBOX_WIDTH = 600;
const VIEWBOX_HEIGHT = 400;

export default function DrawArea() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const getSvgCoords = (mouseEvent: React.MouseEvent | MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const pt = svg.createSVGPoint();
    pt.x = mouseEvent.clientX;
    pt.y = mouseEvent.clientY;

    const svgPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: svgPoint.x, y: svgPoint.y };
  };

  const handleMouseDown = (mouseEvent: React.MouseEvent) => {
    // only start on left click
    if (mouseEvent.button !== 0) return;

    const point = getSvgCoords(mouseEvent);

    setLines((prevLines) => [...prevLines, [point]]);
    setIsDrawing(true);
  };

  useEffect(() => {
    let pending = false;
    const handleMouseMove = (mouseEvent: MouseEvent) => {
      if (!isDrawing) {
        return;
      }
      if (!pending) {
        pending = true;
        const point = getSvgCoords(mouseEvent);

        // throttles path updates to at most once per frame
        // at least, that's the intention
        requestAnimationFrame(() => {
          setLines((prevLines) => {
            const newLines = [...prevLines];
            const currentLine = newLines[newLines.length - 1];

            if (currentLine) {
              const last = currentLine[currentLine.length - 1];
              const dx = point.x - last.x;
              const dy = point.y - last.y;
              const dist2 = dx * dx + dy * dy;

              if (dist2 < 1) return newLines;

              const k = 0.2; // weight given to new point, controls smoothing
              // lower k lags behind more, higher k more responsive (but more)
              const smoothed = {
                x: last.x * (1 - k) + point.x * k,
                y: last.y * (1 - k) + point.y * k,
              };
              currentLine.push(smoothed);
            }

            return newLines;
          });

          pending = false;
        });
      }
    };

    const handleMouseUp = (mouseEvent: MouseEvent) => {
      handleMouseMove(mouseEvent);
      setIsDrawing(false);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDrawing]);

  return (
    <div
      className={`border aspect-[${VIEWBOX_WIDTH}/${VIEWBOX_HEIGHT}] w-full`}
    >
      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        className="w-full h-full"
        ref={svgRef}
        onMouseDown={handleMouseDown}
      >
        {lines.map((line, index) => (
          <DrawingLine key={index} line={line} />
        ))}
      </svg>
    </div>
  );
}
