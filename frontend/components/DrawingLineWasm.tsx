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

    // const start = performance.now();
    const pathData = pointsToPathWasm(line.points, smoothing);
    // const end = performance.now();
    // console.log(`pointsToPathWasm took ${end - start} ms`);

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
