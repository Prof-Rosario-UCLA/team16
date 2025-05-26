import { Point, Line } from "@/components/DrawArea";
import React, { memo } from "react";

//
// MATH IS BASICALLY STRAIGHT FROM
// https://francoisromain.medium.com/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
//

// compute vector and angle between two points
// I:  - pointA: { x, y }
//     - pointB: { x, y }
// O:  - { length, angle }: euclidean distance and direction from A to B
const findOpposedLine = (pointA: Point, pointB: Point) => {
  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;
  return {
    length: Math.sqrt(dx ** 2 + dy ** 2),
    angle: Math.atan2(dy, dx),
  };
};

// compute a control point for smooth bezier curves
// I:  - current: { x, y }
//     - previous: { x, y } | null
//     - next: { x, y } | null
//     - reverse: boolean (optional) — flip direction
// O:  - { x, y }: bezier control point
const findControlPoint = (
  current: Point,
  previous: Point | null,
  next: Point | null,
  reverse: boolean,
  smoothing: number = 0.2
): Point => {
  const p = previous ?? current;
  const n = next ?? current;
  const o = findOpposedLine(p, n);
  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * smoothing;
  return {
    x: current.x + Math.cos(angle) * length,
    y: current.y + Math.sin(angle) * length,
  };
};

// generate an SVG bezier segment
// I:  - point: { x, y }
//     - i: index of the point in array a
//     - a: full array of points
// O:  - SVG 'C' bezier command string
const generateBezier = (
  point: Point,
  i: number,
  a: Point[],
  smoothing: number
) => {
  const cps = findControlPoint(
    a[i - 1] ?? null,
    a[i - 2] ?? null,
    point,
    false,
    smoothing
  );
  const cpe = findControlPoint(
    point,
    a[i - 1] ?? null,
    a[i + 1] ?? null,
    true,
    smoothing
  );
  return `C ${cps.x},${cps.y} ${cpe.x},${cpe.y} ${point.x},${point.y}`;
};

export const pointsToPath = (points: Point[], smoothing: number) => {
  return points.reduce((acc, point, i, arr) => {
    if (i === 0) {
      return `M ${point.x},${point.y}`;
    }
    return acc + " " + generateBezier(point, i, arr, smoothing);
  }, "");
};
// render a smooth bezier line through an array of points

interface DrawingLineProps {
  line: Line; // array of points
  smoothing?: number;
}

export const DrawingLine = memo(
  ({
    line,
    smoothing = 0.2, // default smoothing factor
  }: DrawingLineProps) => {
    if (line.points.length === 0) return null;

    const pathData = pointsToPath(line.points, smoothing);

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
DrawingLine.displayName = "DrawingLine";
