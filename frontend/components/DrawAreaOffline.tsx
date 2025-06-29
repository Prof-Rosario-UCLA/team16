/* eslint-disable @next/next/no-img-element */
"use client";

import { memo, useEffect, useRef, useState } from "react";
import { DrawingLine, pointsToPath } from "@/components/DrawingLine";
import { customAlphabet } from "nanoid";

const generateId = customAlphabet("1234567890abcdef", 6);

const brushSizes = [4, 10, 20];
const colorPalette = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "black",
];

export type Point = { x: number; y: number };
export type Line = { points: Point[]; color: string; width: number; id: string };

const VIEWBOX_WIDTH = 400;
const VIEWBOX_HEIGHT = 300;

export default function DrawAreaOffline() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [localLines, setLocalLines] = useState<Line[]>([]);
  const [erase, setErase] = useState(false);
  const [strokeColor, setStrokeColor] = useState("black");
  const [strokeWidth, setStrokeWidth] = useState(brushSizes[0]);

  const actualStrokeColor = erase ? "white" : strokeColor;
  const svgRef = useRef<SVGSVGElement | null>(null);

  const getSvgCoords = (mouseEvent: React.MouseEvent | MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = mouseEvent.clientX;
    pt.y = mouseEvent.clientY;
    const svgPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return {
      x: Math.round(svgPoint.x * 100) / 100,
      y: Math.round(svgPoint.y * 100) / 100,
    };
  };

  useEffect(() => {
    setIsDrawing(false);
  }, []);

  const handleMouseDown = (mouseEvent: React.MouseEvent) => {
    if (mouseEvent.button !== 0) return;
    const point = getSvgCoords(mouseEvent);
    const newLine: Line = {
      points: [point],
      color: actualStrokeColor,
      width: strokeWidth,
      id: generateId(),
    };
    setLocalLines((prevLines) => [...prevLines, newLine]);
    setIsDrawing(true);
  };

  useEffect(() => {
    let pending = false;
    const handleMouseMove = (mouseEvent: MouseEvent) => {
      if (!isDrawing) return;
      if (!pending) {
        pending = true;
        const point = getSvgCoords(mouseEvent);
        requestAnimationFrame(() => {
          setLocalLines((prevLines) => {
            if (prevLines.length === 0) return prevLines;
            const lastLine = prevLines[prevLines.length - 1];
            const last = lastLine.points[lastLine.points.length - 1];
            const dx = point.x - last.x;
            const dy = point.y - last.y;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < 1) return prevLines;
            const k = 0.25;
            const smoothed = {
              x: last.x * (1 - k) + point.x * k,
              y: last.y * (1 - k) + point.y * k,
            };
            const updatedLine = {
              ...lastLine,
              points: [...lastLine.points, smoothed],
            };
            const newLines = [
              ...prevLines.slice(0, prevLines.length - 1),
              updatedLine,
            ];
            return newLines;
          });
          pending = false;
        });
      }
    };
    const handleMouseUp = () => {
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
      className={`nes-container h-full w-auto relative`}
      style={{ padding: 0, aspectRatio: `${VIEWBOX_WIDTH}/${VIEWBOX_HEIGHT}` }}
    >
      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        ref={svgRef}
        onMouseDown={handleMouseDown}
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        className="bg-white"
      >
        {localLines.map((line) => (
          <DrawingLine key={line.id} line={line} />
        ))}
      </svg>
      <DrawAreaControls
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        erase={erase}
        setStrokeColor={setStrokeColor}
        setStrokeWidth={setStrokeWidth}
        setErase={setErase}
        clear={() => setLocalLines([])}
      />
      {/* download */}
      <div className="absolute bottom-[-4.5em] right-0 text-xs">
        <button
          className="nes-btn is-success"
          onClick={() => exportDrawing(localLines)}
        >
          Download as PNG
        </button>
      </div>
    </div>
  );
}

interface DrawAreaControlsProps {
  strokeColor: string;
  strokeWidth: number;
  erase: boolean;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setErase: (erase: boolean) => void;
  clear: () => void;
}

const DrawAreaControls = memo(
  ({
    strokeColor,
    strokeWidth,
    erase,
    setStrokeColor,
    setStrokeWidth,
    setErase,
    clear,
  }: DrawAreaControlsProps) => (
    <>
      {/* color palette */}
      <div className="flex flex-col gap-2 absolute top-0 left-0 p-4">
        {colorPalette.map((color) => (
          <button
            key={color}
            className={`border-4 transition-all ${
              color === strokeColor ? "w-6 h-6" : "w-8 h-8"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => {
              setStrokeColor(color);
              setErase(false);
            }}
          />
        ))}
      </div>
      {/* tool toggle */}
      <div className="flex flex-col absolute top-0 right-0 p-4 gap-2">
        <button
          onClick={() => setErase(false)}
          className={`size-8 ${erase ? "opacity-20" : ""}`}
        >
          <img src="/brush.png" alt="Brush" />
        </button>
        <button
          onClick={() => setErase(true)}
          className={`size-8 ${!erase ? "opacity-20" : ""}`}
        >
          <img src="/eraser.png" alt="Eraser" />
        </button>
      </div>
      {/* stroke width */}
      <div className="flex flex-col absolute right-0 top-1/2 -translate-y-1/2 p-4">
        {brushSizes.map((size, i) => (
          <button
            key={size}
            onClick={() => setStrokeWidth(size)}
            className={`flex items-center justify-center py-2 ${
              strokeWidth !== size ? "opacity-50" : ""
            }`}
          >
            <img
              src="/circle.png"
              alt={`${size}px brush`}
              style={{
                width: (i + 1) * 12,
                height: (i + 1) * 12,
                imageRendering: "pixelated",
              }}
            />
          </button>
        ))}
      </div>
      {/* clear */}
      <button className="absolute bottom-0 right-0 p-2" onClick={clear}>
        <img src="/trash.png" alt="Clear" className="size-8" />
      </button>
    </>
  )
);
DrawAreaControls.displayName = "DrawAreaControls";

const exportDrawing = (lines: Line[]) => {
  const scale = 3;
  const canvas = document.createElement("canvas");
  canvas.width = VIEWBOX_WIDTH * scale;
  canvas.height = VIEWBOX_HEIGHT * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scale, scale);
  ctx.lineCap = "round";
  lines.forEach((line) => {
    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.width;
    ctx.beginPath();
    const path = new Path2D();
    path.addPath(new Path2D(pointsToPath(line.points, 0.2)));
    ctx.stroke(path);
  });
  const img = new Image();
  img.src = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = img.src;
  link.download = "drawing.png";
  link.click();
};
