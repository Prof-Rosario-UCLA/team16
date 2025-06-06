import { Line } from "@/components/DrawArea";
import { pointsToPathWasm } from "@/utils/pointsToPathWasm";
import { memo } from "react";

interface DrawingLineProps {
  line: Line; // array of points
  smoothing?: number;
}

export const DrawingLineWasm = memo(
  ({
    line,
    smoothing = 0.2, // default smoothing factor
  }: DrawingLineProps) => {
    if (line.points.length === 0) return null;
    if (line.points.length === 1) {
      // If only one point, draw a dot
      return (
        <circle
          cx={line.points[0].x}
          cy={line.points[0].y}
          r={line.width / 2}
          fill={line.color}
        />
      );
    }

    const start = performance.now();
    const pathData = pointsToPathWasm(line.points, smoothing);
    const end = performance.now();
    if (end - start > 10) {
      console.warn(
        `pointsToPathWasm took ${
          end - start
        } ms, which is longer than expected.`
      );
    }

    return (
      <path
        d={pathData}
        strokeWidth={line.width}
        strokeLinecap="round"
        fill="none"
        stroke={line.color}
      />
    );
  }
);
DrawingLineWasm.displayName = "DrawingLineWasm";
