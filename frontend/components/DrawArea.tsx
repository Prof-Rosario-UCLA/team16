"use client";

import { useImperativeHandle } from "react";
import { DrawingLine, pointsToPath } from "@/components/DrawingLine";
import { useEffect, useRef, useState } from "react";

export type Point = {
  x: number;
  y: number;
};

export type Line = {
  points: Point[];
  color: string;
  width: number;
};

export type DrawAreaRef = {
  clear: () => void;
  exportDrawing: () => void;
};

const VIEWBOX_WIDTH = 600;
const VIEWBOX_HEIGHT = 400;

interface DrawAreaProps {
  onLineStart?: (line?: Line) => void;
  onLineEnd?: (line?: Line) => void;
  onLineUpdate?: (line: Line) => void;
  incomingPaths?: Line[];
  clearTrigger?: never; // change prop to trigger canvas clear
  strokeColor?: string;
  strokeWidth?: number;
  erase?: boolean;
  ref?: React.ForwardedRef<DrawAreaRef>;
}

export default function DrawArea({
  onLineStart: onStart,
  onLineEnd: onEnd,
  onLineUpdate: onUpdate,
  incomingPaths = [],
  clearTrigger,
  strokeColor = "black",
  strokeWidth = 6,
  erase = false,
  ref,
}: DrawAreaProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);

  const linesRef = useRef<Line[]>(lines);
  linesRef.current = lines; // useImperativeHandle does not get updated lines without this
  // expose clear and exportDrawing methods to parent component
  useImperativeHandle(
    ref,
    () => {
      return {
        clear: () => setLines([]),
        exportDrawing: () => exportDrawing(linesRef.current),
      };
    },
    [linesRef]
  );

  const actualStrokeColor = erase ? "white" : strokeColor;

  // clear canvas when clearTrigger changes
  useEffect(() => {
    setLines([]);
  }, [clearTrigger]);

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

    setLines((prevLines) => [
      ...prevLines,
      { points: [point], color: actualStrokeColor, width: strokeWidth },
    ]);
    setIsDrawing(true);
    onStart?.({
      points: [point],
      color: actualStrokeColor,
      width: strokeWidth,
    });
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
              const last = currentLine.points[currentLine.points.length - 1];
              const dx = point.x - last.x;
              const dy = point.y - last.y;
              const dist2 = dx * dx + dy * dy;

              if (dist2 < 1) return newLines;

              const k = 0.25; // weight given to new point, controls smoothing
              // lower k lags behind more, higher k more responsive (but more)
              const smoothed = {
                x: last.x * (1 - k) + point.x * k,
                y: last.y * (1 - k) + point.y * k,
              };
              currentLine.points.push(smoothed);
              onUpdate?.(currentLine);
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
      const currentLine = lines[lines.length - 1];
      if (currentLine) {
        onEnd?.(currentLine);
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDrawing, lines, onEnd, onUpdate]);

  return (
    <div className={`border aspect-[3/2] h-auto w-full max-w-[100vh]`}>
      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        ref={svgRef}
        onMouseDown={handleMouseDown}
        className="w-full h-full border"
      >
        {lines.concat(incomingPaths).map((line, index) => (
          <DrawingLine key={index} line={line} />
        ))}
      </svg>
    </div>
  );
}

const exportDrawing = (lines: Line[]) => {
  const scale = 3;

  const canvas = document.createElement("canvas");
  canvas.width = VIEWBOX_WIDTH * scale;
  canvas.height = VIEWBOX_HEIGHT * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scale, scale); // scale so we're still in the same coordinate system

  ctx.lineCap = "round";
  lines.forEach((line) => {
    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.width;
    ctx.beginPath();
    const path = new Path2D();
    path.addPath(new Path2D(pointsToPath(line.points, 0.2)));
    ctx.stroke(path);
  });
  console.log("Exporting drawing...");
  console.log("Lines:", lines);
  const img = new Image();
  img.src = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = img.src;
  link.download = "drawing.png";
  link.click();
};
