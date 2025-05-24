"use client";

import { useEffect, useRef, useState } from "react";

type Point = {
  x: number;
  y: number;
};

type Line = Point[];

const VIEWBOX_WIDTH = 600;
const VIEWBOX_HEIGHT = 400;

export default function DrawArea() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const relativeCoordinatesForEvent = (
    mouseEvent: React.MouseEvent | MouseEvent
  ) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const pt = svg.createSVGPoint();
    pt.x = mouseEvent.clientX;
    pt.y = mouseEvent.clientY;

    const svgPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: svgPoint.x, y: svgPoint.y };
  };

  const handleMouseDown = (mouseEvent: React.MouseEvent) => {
    const point = relativeCoordinatesForEvent(mouseEvent);

    setLines((prevLines) => [...prevLines, [point]]);
    setIsDrawing(true);
  };

  useEffect(() => {
    const handleMouseMove = (mouseEvent: MouseEvent) => {
      if (!isDrawing) {
        return;
      }

      const point = relativeCoordinatesForEvent(mouseEvent);

      setLines((prevLines) => {
        const newLines = [...prevLines];
        const currentLine = newLines[newLines.length - 1];
        if (currentLine) {
          currentLine.push(point);
        }
        return newLines;
      });
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

// const Drawing = ({ lines }: { lines: Line[] }) => {
//   return (
//     <svg
//       viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
//       className="border w-full h-full"
//     >
//       {lines.map((line, index) => (
//         <DrawingLine key={index} line={line} />
//       ))}
//     </svg>
//   );
// };

const DrawingLine = ({ line }: { line: Line }) => {
  const pathData = "M " + line.map((p) => `${p.x} ${p.y}`).join(" L ");
  return (
    <path
      d={pathData}
      stroke="black"
      strokeWidth={6}
      strokeLinecap="round"
      fill="none"
    />
  );
};
