import { Server, Socket } from "socket.io";
import { customAlphabet } from "nanoid";

const generateId = customAlphabet("1234567890abcdef", 6);
const ROUND_DURATION = 30 * 1000; // 30 seconds
const INTERVAL = 3 * 1000; // 3 second interval
const NUM_ROUNDS = 2

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

type Round = {
  roundNum: number | null;
  drawerIndex: number | null;
  endTime: number | null;
  word: string | null;
  activeGuessers: Map<string, boolean> | null; // maps usernames to booleans - if usr is still guessing, bool is True
}

type GameState = {
  // js guarantees insertion order so this works!
  // global line id to line
  id: string;
  lines: Map<string, Line>;
  players: Player[]; // player includes points
  round: Round // round info
  status: string; // notStarted, active, ended
  usersToSocket: Map<string, string>; // every game room should have at least one user in it
};

const games = new Map<string, GameState>();

const dummyWords = ["giraffe", "elephant", "dog", "cat", "flower"]

export function setupGameSocket(io: Server, socket: Socket) {
  // joining a game
  socket.on("join_game", (gameId: string, cb?: () => void) => {
    console.log("User connected", socket.data.user);

    socket.data.gameId = gameId;
    socket.data.lines = new Map<string, string>(); // client to global line ids

    // create game state if it doesn't exist
    if (!games.has(gameId)) {
      let usersToSocket = new Map<string, string>();
      usersToSocket.set(socket.data.user, socket.id)
      games.set(gameId, {
        id: gameId,
        lines: new Map(),
        players: [],
        round: {
          roundNum: null,
          drawerIndex: null,
          endTime: null,
          word: null,
          activeGuessers: null,
        },
        status: "notStarted",
        usersToSocket: usersToSocket
      });
    }
    
    // cannot join a game that has already begun
    const game = games.get(gameId)!;
    if (game.status === "active") {
      socket.emit("error_message", { message: "Game already started. Cannot join." });
      return;
    }

    // cannot join a game that has ended
    if (game.status === "ended") {
      socket.emit("error_message", { message: "Game has ended. Cannot join." });
      return;
    }

    // update player list
    const playerExists = game.players.some(p => p.name === socket.data.user);
    if (!playerExists) {
      game.players.push({
        name: socket.data.user,
        points: 0,
        isDrawing: false,
      } as Player);
      game.usersToSocket.set(socket.data.user, socket.id);
    }

    socket.join(gameId);

    io.to(gameId).emit("user_joined", {  // frontend handle add user
      user: socket.data.user, 
      players: game.players,
    });

    if (cb) cb();
  });

  socket.on("start_game", () => {
    const gameId = socket.data.gameId;

    if (gameId) {
      const game = games.get(gameId)!;
      // don't start game if < 2 players
      if (game.players.length < 2) {
        const message = `Need at least 2 players to start. ${game.players}`;
        io.to(gameId).emit("error_message", { message: message });
        return
      }
      const drawerIndex = 0;
      const word = dummyWords[Math.floor(Math.random() * dummyWords.length)]; // TODO: pull from database

      // clear canvas
      games.get(socket.data.gameId)?.lines.clear();
      io.to(gameId).emit("clear_lines");

      // initialize active guessers map
      let activeGuessers = new Map<string, boolean>();
      game.players.forEach((player, index) => {
        if (index != drawerIndex) {
          activeGuessers.set(player.name, true)
        } else {
          activeGuessers.set(player.name, false)
        }
      })
      
      // initialize first round
      game.round = {
        roundNum: 1,
        drawerIndex,
        endTime: null, // don't set endTime yet (don't start immediately)
        word,
        activeGuessers: activeGuessers,
      }
      game.status = "active"

      console.log(`Game ${gameId} started`);
      
      // reveal round number and current drawer to everyone
      io.to(gameId).emit("reveal_info", {
        roundNum: game.round.roundNum,
        currDrawer: game.players[drawerIndex].name,
        wordLength: game.round.word?.length ?? 0
      });

      // only reveal word to the current drawer
      const drawerSocket = [...io.sockets.sockets.values()].find(
        (s) => s.data.user === game.players[drawerIndex].name && s.data.gameId === gameId
      );
      if (drawerSocket) {
        drawerSocket.emit("reveal_word", { word });
      }

      // wait 5 seconds, then start timer
      setTimeout(() => {
        const endTime = Date.now() + ROUND_DURATION;
        game.round.endTime = endTime;

        io.to(gameId).emit("start_turn", { endTime });

        console.log(`Turn started in game ${gameId}`);
      }, INTERVAL);
    }
  });

  socket.on("end_turn", () => {
    const gameId = socket.data.gameId;
    if (!gameId) return;
 
    if (gameId) {
      const game = games.get(gameId)!;

      // advance drawer
      const currentIndex = game.round.drawerIndex!;
      const nextDrawerIndex = (currentIndex + 1) % game.players.length;

      // advance round if needed
      let nextRoundNum = game.round.roundNum ?? 1;
      if (currentIndex >= game.players.length - 1) {
        nextRoundNum += 1;
      }

      const nextWord = dummyWords[Math.floor(Math.random() * dummyWords.length)]; // TODO: fetch from database

      if (nextRoundNum > NUM_ROUNDS) {
        game.status = "ended"
        io.to(gameId).emit("game_ended", { game });
        return;
      }
      
      let newActiveGuessers = new Map<string, boolean>();
      game.players.forEach((player, index) => {
        if (index != nextDrawerIndex) {
          newActiveGuessers.set(player.name, true)
        } else {
          newActiveGuessers.set(player.name, false)
        }
      })

      // update game.round
      game.round = {
        roundNum: nextRoundNum,
        drawerIndex: nextDrawerIndex,
        endTime: null,
        word: nextWord,
        activeGuessers: newActiveGuessers,
      };

      // clear canvas
      games.get(socket.data.gameId)?.lines.clear();
      io.to(gameId).emit("clear_lines");

      io.to(gameId).emit("reveal_info", {
        roundNum: nextRoundNum,
        currDrawer: game.players[nextDrawerIndex].name,
        wordLength: game.round.word?.length ?? 0
      });

      const drawerSocket = [...io.sockets.sockets.values()].find(
        (s) => s.data.user === game.players[nextDrawerIndex].name && s.data.gameId === gameId
      );
      
      if (drawerSocket) {
        drawerSocket.emit("reveal_word", { word: nextWord });
      }

      // wait 5 seconds, then start timer
      setTimeout(() => {
        const endTime = Date.now() + ROUND_DURATION;
        game.round.endTime = endTime;

        io.to(gameId).emit("start_turn", { endTime });
      }, INTERVAL);
    }

    
  })

  socket.on("end_game", () => {
    const gameId = socket.data.gameId;
    if (gameId) {
      const game = games.get(gameId)!;
      game.round = {
        roundNum: null,
        drawerIndex: null,
        endTime: null,
        word: null,
        activeGuessers: null
      };
      game.status = "ended"

      games.get(socket.data.gameId)?.lines.clear();
      io.to(gameId).emit("clear_lines");
      io.to(gameId).emit("game_ended", { game });
      console.log(`Game ${gameId} ended`);
    }
  });

  // chat
  socket.on("send_message", (message: string) => {
    console.log("User sent message", message);
    let isPublic : (boolean | undefined) = true;

    const gameId = socket.data.gameId;
    if (gameId) {
      const game = games.get(gameId)!;
      let user = socket.data.user

      // if user is still guessing, check if their message was the correct guess
      if (game.round.activeGuessers?.get(user)) {
        if (message === game.round.word) {
          console.log(`${user} guessed the word correctly!`)
          // remove user from active guessers
          game.round.activeGuessers?.set(user, false) 
          
          // update users points. score is number of (ms until round.endTime) / 100
          if (game.round.endTime) {
            const score = Math.round((game.round.endTime - Date.now()) / 100);
            game.players.forEach((player: Player) => {
              if (player.name === user) {
                player.points += score;
                console.log(game.players);

                // share that user guessed correctly
                io.to(gameId).emit("correct_guess", { 
                  user: user,
                  players: game.players
                });
              }
            })
          }
        }
      }
      // if user is the drawer or guessed correctly, will be set to false
      isPublic = (typeof game.round.activeGuessers?.get(user) !== "undefined") ? game.round.activeGuessers?.get(user) : true;

      if (isPublic) { // if public message, broadcast to everyone
        io.in(socket.data.gameId).emit("receive_message", { 
          message,
          user: socket.data.user,
          isPublic: isPublic
        });
      } else { // otherwise, send to all non active guessers
        game.round.activeGuessers?.forEach((isGuessing: boolean, playerId: string) => {
          if (!isGuessing) { 
            const playerSocketId = game.usersToSocket.get(playerId);
            if (playerSocketId) {
              io.to(playerSocketId).emit("receive_message", {
                message,
                user,
                isPublic: isPublic,
              })
            }
          }
        })
      }
    }
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
      players: game.players
    });

    if (game.players.length < 2 && game.status === "active") {
      game.status = "ended"
      io.to(gameId).emit("error_message", { message: "Not enough players remaining. Ending game." });
      io.to(gameId).emit("game_ended", { game });

      game.round = {
        roundNum: null,
        drawerIndex: null,
        endTime: null,
        word: null,
        activeGuessers: null,
      };
    }

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
