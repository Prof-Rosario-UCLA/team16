import DrawArea, { Line, Point } from "@/components/DrawArea";
import { useSocketContext } from "@/contexts/SocketContext";
import { useEffect, useRef, useState } from "react";
import { throttle } from "throttle-debounce";

type LineUpdate = {
  newPoints: Point[];
  id: string;
};

const DrawAreaSockets = () => {
  const [globalLines, setGlobalLines] = useState<Map<string, Line>>(new Map());
  const [pruneLocalTrigger, setPruneLocalTrigger] = useState(false);
  const [clearLocalTrigger, setClearLocalTrigger] = useState(false);
  const numPoints = useRef(0);

  const globalToLocalIds = useRef(new Map<string, string>());

  const socket = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    socket.on("line_start", (line) => {
      setGlobalLines((prev) => new Map(prev).set(line.id, line));
    });

    socket.on("line_update", (lineUpdate: LineUpdate) => {
      setGlobalLines((prev) => {
        const newLines = new Map(prev);
        const existingLine = newLines.get(lineUpdate.id);
        if (existingLine) {
          const currPoints = existingLine.points;
          newLines.set(lineUpdate.id, {
            ...existingLine,
            points: [...currPoints, ...lineUpdate.newPoints],
          });
        }
        return newLines;
      });
    });

    socket.on("line_end", (line: Line) => {
      setGlobalLines((prev) => new Map(prev).set(line.id, line));

      if (globalToLocalIds.current.has(line.id)) {
        setPruneLocalTrigger((prev) => !prev);
      }
    });

    socket.on("clear_lines", () => {
      setGlobalLines(new Map());
      globalToLocalIds.current.clear();
      numPoints.current = 0;
      setPruneLocalTrigger((prev) => !prev);
    });

    return () => {
      socket.off("line_start");
      socket.off("line_update");
      socket.off("line_end");
      socket.off("clear_lines");
    };
  }, [socket]);

  const handleLineStart = (line: Line) => {
    if (!socket) return;

    socket.emit("line_start", line, (globalId: string) => {
      globalToLocalIds.current.set(globalId, line.id);
      numPoints.current = line.points.length;
    });
  };

  const handleLineUpdate = (line: Line) => {
    if (!socket) return;

    // only emit new points
    const newPoints = line.points.slice(numPoints.current);
    numPoints.current = line.points.length;
    if (newPoints.length > 0) {
      socket.emit("line_update", { newPoints, id: line.id });
    }
  };

  const handleLineEnd = (line: Line) => {
    if (!socket) return;
    socket.emit("line_end", line);
  };

  const handleClear = () => {
    if (!socket) return;
    socket.emit("clear_lines");
    setGlobalLines(new Map());
    globalToLocalIds.current.clear();
    numPoints.current = 0;
    setClearLocalTrigger((prev) => !prev);
  };

  return (
    <DrawArea
      onLineStart={handleLineStart}
      onLineUpdate={throttle(50, handleLineUpdate)}
      onLineEnd={handleLineEnd}
      onClear={handleClear}
      globalLines={[...globalLines.values()]}
      pruneLocalTrigger={pruneLocalTrigger}
      clearLocalTrigger={clearLocalTrigger}
    />
  );
};
export default DrawAreaSockets;
