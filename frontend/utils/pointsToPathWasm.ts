import { Point } from "@/components/DrawArea";
import * as rustWasm from "@/wasm/bezier/pkg/bezier";

let wasmInstance: rustWasm.InitOutput | null = null;
// initialize wasm first
const initWasm = async () => {
  try {
    wasmInstance = await rustWasm.default();
    console.log("[WASM] loaded successfully");
  } catch (err) {
    console.error("[WASM] failed to load:", err);
  }
};
initWasm();

export const pointsToPathWasm = (points: Point[], smoothing = 0.2) => {
  if (!wasmInstance) {
    return "";
  }
  const rustPoints = points.map(
    (coord) => new rustWasm.Point(coord.x, coord.y)
  );
  return rustWasm.points_to_path(rustPoints, smoothing);
};
