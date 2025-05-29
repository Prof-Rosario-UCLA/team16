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

type Player = {
  name: string;
  points: number;
  isDrawing: boolean;
};

type GameState = {
  // js guarantees insertion order so this works!
  // global line id to line
  id: String;
  lines: Map<string, Line>;
  players: Player[];
};

const games = new Map<string, GameState>();

export function setupGameSocket(io: Server, socket: Socket) {
  // joining a game
  socket.on("join_game", (gameId: string, cb?: () => void) => {
    console.log("User connected", socket.data.user);
    socket.data.gameId = gameId;

    socket.data.lines = new Map<string, string>(); // client to global line ids

    // create game state if it doesn't exist
    if (!games.has(gameId)) {
      games.set(gameId, {
        id: gameId,
        lines: new Map(),
        players: [],
      });
    }
    
    const game = games.get(gameId)!;
    socket.join(gameId);

    const playerExists = game.players.some(p => p.name === socket.data.user);
    if (!playerExists) {
      game.players.push({
        name: socket.data.user,
        points: 0,
        isDrawing: false,
      } as Player);
    }

    io.to(gameId).emit("user_joined", { user: socket.data.user, game: games.get(gameId) });

    if (cb) cb();
  });

  socket.on("start_game", () => {
    const gameId = socket.data.gameId;
    if (gameId) {
      io.to(gameId).emit("game_started");
      console.log(`Game ${gameId} started`);
    }
  });
  socket.on("end_game", () => {
    const gameId = socket.data.gameId;
    if (gameId) {
      io.to(gameId).emit("game_ended");
      console.log(`Game ${gameId} ended`);
    }
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
    const gameId = socket.data.gameId;
    const user = socket.data.user;
    
    if (!gameId || !games.has(gameId)) return;
    const game = games.get(gameId)!;
    
    // remove player from game's player list
    game.players = game.players.filter(p => p.name !== user);

    socket.to(socket.data.gameId).emit("user_left", {
      user: socket.data.user,
      game: game
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
    games.get(socket.data.gameId)?.lines.set(globalLine.id, globalLine);

    // emit to everyone in game except sender
    socket.to(socket.data.gameId).emit("line_start", globalLine);

    // notify client of global id for their line
    cb?.(globalLine.id);
  });

  socket.on("line_update", (lineUpdate: LineUpdate) => {
    const existingLineId = socket.data.lines.get(lineUpdate.id);
    const existingLine = games
      .get(socket.data.gameId)
      ?.lines.get(existingLineId);
    if (!existingLine) return;

    existingLine.points.push(...lineUpdate.newPoints);

    // emit to everyone in game except sender
    socket
      .to(socket.data.gameId)
      .emit("line_update", { ...lineUpdate, id: existingLineId });
  });

  socket.on("line_end", (line: Line) => {
    const existingLineId = socket.data.lines.get(line.id);
    const existingLine = games
      .get(socket.data.gameId)
      ?.lines.get(existingLineId);
    if (!existingLine) return;

    existingLine.points = line.points;
    // emit to sender as well so they can prune from local state
    io.in(socket.data.gameId).emit("line_end", existingLine);
  });

  socket.on("clear_lines", () => {
    console.log("Clearing lines for game", socket.data.gameId);
    games.get(socket.data.gameId)?.lines.clear();
    socket.to(socket.data.gameId).emit("clear_lines");
  });
}
