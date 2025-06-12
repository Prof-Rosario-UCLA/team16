/* eslint-disable @next/next/no-img-element */
"use client";

import { memo } from "react";
import { useEffect, useRef, useState } from "react";
import { customAlphabet } from "nanoid";
// import { DrawingLineWasm } from "@/components/DrawingLineWasm";
import { DrawingLine } from "@/components/DrawingLine";
import playSound from "@/utils/playSound";
import { useAspectRatio } from "@/utils/useAspectRatio";
import { pointsToPathWasm } from "@/utils/pointsToPathWasm";

// import { pointsToPath } from "@/components/DrawingLine";
// const USE_WASM = false;
const Line = DrawingLine;

const generateId = customAlphabet("1234567890abcdef", 6);

const brushSizes = [4, 10, 20];
const colorPalette = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "black",
];

export type Point = {
  x: number;
  y: number;
};

export type Line = {
  points: Point[];
  color: string;
  width: number;
  id: string;
};

export type DrawAreaRef = {
  clear: () => void;
  exportDrawing: () => void;
};

const VIEWBOX_WIDTH = 400;
const VIEWBOX_HEIGHT = 300;

interface DrawAreaProps {
  onLineStart?: (line: Line) => void;
  onLineEnd?: (line: Line) => void;
  onLineUpdate?: (line: Line) => void;
  onClear?: () => void;
  globalLines?: Line[];
  pruneLocalTrigger?: boolean;
  clearLocalTrigger?: boolean;
  isCurrDrawer: boolean;
}

export default function DrawArea({
  onLineStart,
  onLineEnd,
  onLineUpdate,
  onClear,
  globalLines = [],
  pruneLocalTrigger = false,
  clearLocalTrigger = false,
  isCurrDrawer,
}: DrawAreaProps) {
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
  const getTouchSvgCoords = (
    e: TouchEvent | React.TouchEvent,
    useChangedTouches = false
  ) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const touches = useChangedTouches ? e.changedTouches : e.touches;
    const touch = touches[0];
    if (!touch) return { x: 0, y: 0 };

    const pt = svg.createSVGPoint();
    pt.x = touch.clientX;
    pt.y = touch.clientY;

    const svgPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return {
      x: Math.round(svgPoint.x * 100) / 100,
      y: Math.round(svgPoint.y * 100) / 100,
    };
  };

  useEffect(() => {
    setLocalLines((prevLines) => {
      if (prevLines.length === 0) return prevLines;
      // prune oldest line
      console.log("Pruning local lines");
      return prevLines.slice(1, prevLines.length);
    });
  }, [pruneLocalTrigger]);

  useEffect(() => {
    // clears canvas, stops drawing
    setLocalLines([]);
    setIsDrawing(false);
  }, [clearLocalTrigger]);

  const handleMouseDown = (mouseEvent: React.MouseEvent) => {
    if (isCurrDrawer) {
      // only start drawing if is curr drawer
      // only start on left click
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
      onLineStart?.(newLine);
    }
  };

  useEffect(() => {
    let pending = false;
    const handleMouseMove = (mouseEvent: MouseEvent) => {
      if (!isDrawing || pending) {
        return;
      }

      pending = true;
      const point = getSvgCoords(mouseEvent);

      // throttles path updates to at most once per frame
      // at least, that's the intention
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

          onLineUpdate?.(updatedLine);

          return newLines;
        });

        pending = false;
      });
    };

    const handleMouseUp = (mouseEvent: MouseEvent) => {
      handleMouseMove(mouseEvent);
      setIsDrawing(false);
      const currentLine = localLines[localLines.length - 1];
      if (currentLine) {
        onLineEnd?.(currentLine);
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDrawing, localLines, onLineEnd, onLineUpdate]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const point = getTouchSvgCoords(e);
    const newLine: Line = {
      points: [point],
      color: actualStrokeColor,
      width: strokeWidth,
      id: generateId(),
    };

    setLocalLines((prevLines) => [...prevLines, newLine]);
    setIsDrawing(true);
    onLineStart?.(newLine);
  };

  useEffect(() => {
    let pending = false;
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDrawing || pending) {
        return;
      }

      pending = true;
      const point = getTouchSvgCoords(e);

      // throttles path updates to at most once per frame
      // at least, that's the intention
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

          onLineUpdate?.(updatedLine);

          return newLines;
        });

        pending = false;
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const point = getTouchSvgCoords(e, true); // use changedTouches
      if (!point) return;

      if (isDrawing) {
        const currentLine = localLines[localLines.length - 1];
        if (currentLine) {
          const updatedLine = {
            ...currentLine,
            points: [...currentLine.points, point],
          };
          onLineEnd?.(updatedLine);
        }
      }

      setIsDrawing(false);
    };
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDrawing, localLines, onLineEnd, onLineUpdate]);

  const { containerRef, width, height } = useAspectRatio();

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width, height }}
      >
        {/* Canvas container */}
        <div className="nes-container size-full relative !p-0">
          <svg
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            ref={svgRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="100%"
            className="bg-white"
            style={{ touchAction: "none" }}
          >
            {globalLines.concat(localLines).map((line) => (
              <Line key={line.id} line={line} />
            ))}
          </svg>

          {isCurrDrawer ? (
            <DrawAreaControls
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              erase={erase}
              setStrokeColor={setStrokeColor}
              setStrokeWidth={setStrokeWidth}
              setErase={setErase}
              clear={() => {
                setLocalLines([]);
                onClear?.();
              }}
              playSound={playSound}
            />
          ) : null}
        </div>
        <button
          className="absolute bottom-1 left-1 p-2"
          onClick={() => exportDrawing(globalLines.concat(localLines))}
        >
          <img
            src="/icons/download-icon.png"
            alt="Download"
            className="md:size-8 size-6"
            aria-label="Download drawing"
          />
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
  playSound: (src: string) => void;
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
    playSound,
  }: DrawAreaControlsProps) => (
    <>
      {/* color palette */}

      <div className="flex flex-col gap-2 absolute top-0 left-0 p-4 max-h-7/8 flex-wrap h-full pointer-none">
        {colorPalette.map((color) => (
          <button
            aria-label={`Select color ${color}`}
            key={color}
            className={`${
              color === strokeColor ? "border-5" : "border-3"
            } transition-all size-6`}
            style={{ backgroundColor: color }}
            onClick={() => {
              setStrokeColor(color);
              setErase(false);
              playSound("click");
            }}
          />
        ))}
      </div>

      {/* tool toggle */}
      <div className="flex flex-col absolute top-0 right-0 p-4 gap-2">
        <button
          onClick={() => {
            setErase(false);
            playSound("click");
          }}
          aria-label="Select brush tool"
          className={`md:size-8 size-6 ${erase ? "opacity-20" : ""}`}
        >
          <img src="/brush.png" alt="Brush" />
        </button>
        <button
          onClick={() => {
            setErase(true);
            playSound("click");
          }}
          className={`md:size-8 size-6 ${!erase ? "opacity-20" : ""}`}
          aria-label="Select eraser tool"
        >
          <img src="/eraser.png" alt="Eraser" />
        </button>
      </div>

      {/* stroke width */}
      <div className="flex flex-col absolute right-0 top-1/2 -translate-y-1/2 p-4">
        {brushSizes.map((size, i) => (
          <button
            key={size}
            aria-label={`Select brush size ${size}px`}
            onClick={() => {
              setStrokeWidth(size);
              playSound("click");
            }}
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
      <button
        className="absolute bottom-0 right-0 p-2"
        onClick={() => {
          clear();
          playSound("click");
        }}
        aria-label="Clear drawing"
      >
        <img src="/trash.png" alt="Clear" className="md:size-8 size-6" />
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
  ctx.scale(scale, scale); // scale so we're still in the same coordinate system

  ctx.lineCap = "round";
  lines.forEach((line) => {
    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.width;
    ctx.beginPath();
    const path = new Path2D();
    path.addPath(new Path2D(pointsToPathWasm(line.points, 0.2)));
    ctx.stroke(path);
  });
  const img = new Image();
  img.src = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = img.src;
  link.download = "drawing.png";
  link.click();
};
