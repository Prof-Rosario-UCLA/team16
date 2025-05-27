import { Server, Socket } from "socket.io";
import { customAlphabet } from "nanoid";

const generateId = customAlphabet("1234567890abcdef", 6);

type Point = {
  x: number;
  y: number;
};

type Line = {
  points: Point[];
  color: string;
  width: number;
  id: string;
};

type LineUpdate = {
  newPoints: Point[];
  id: string;
};

// js guarantees insertion order so this works!
// global id to line
const lines: Map<string, Line> = new Map();

export function setupGameSocket(io: Server, socket: Socket) {
  // joining a game
  socket.on("join_game", (gameId: string, cb?: () => void) => {
    console.log("User connected", socket.data.user);
    socket.data.gameId = gameId;

    socket.data.lines = new Map<string, string>(); // client to global line ids

    socket.join(gameId);
    io.to(gameId).emit("user_joined", { user: socket.data.user });

    if (cb) cb();
  });

  // chat
  socket.on("send_message", (message: string) => {
    console.log("User sent message", message);
    io.in(socket.data.gameId).emit("receive_message", {
      message,
      user: socket.data.user,
    });
  });

  socket.on("disconnect", () => {
    // handle user disconnect
    socket.to(socket.data.gameId).emit("user_left", {
      user: socket.data.user,
    });
    console.log("User disconnected", socket.data.user);
  });

  // drawing
  socket.on("line_start", (line: Line, cb?: (id: string) => void) => {
    const globalId = generateId();
    // store line in user-specific socket
    socket.data.lines.set(line.id, globalId);

    const globalLine = {
      ...line,
      id: globalId,
    };

    // store line in global state
    lines.set(globalLine.id, globalLine);

    // emit to everyone in game except sender
    socket.to(socket.data.gameId).emit("line_start", globalLine);

    // notify client of global id for their line
    cb?.(globalLine.id);
  });

  socket.on("line_update", (lineUpdate: LineUpdate) => {
    const existingLineId = socket.data.lines.get(lineUpdate.id);
    const existingLine = lines.get(existingLineId);
    if (!existingLine) return;

    existingLine.points.push(...lineUpdate.newPoints);

    // emit to everyone in game except sender
    socket
      .to(socket.data.gameId)
      .emit("line_update", { ...lineUpdate, id: existingLineId });
  });

  socket.on("line_end", (line: Line) => {
    const existingLineId = socket.data.lines.get(line.id);
    const existingLine = lines.get(existingLineId);
    if (!existingLine) return;

    existingLine.points = line.points;
    // emit to sender as well so they can prune from local state
    io.in(socket.data.gameId).emit("line_end", existingLine);
  });

  socket.on("clear_lines", () => {
    console.log("Clearing lines for game", socket.data.gameId);
    lines.clear();
    socket.to(socket.data.gameId).emit("clear_lines");
  });
}
