import { Server, Socket } from "socket.io";

export function setupGameSocket(io: Server, socket: Socket) {
  // joining a game
  socket.on("join_game", (gameId: string, cb?: () => void) => {
    console.log("User connected", socket.data.user);
    socket.data.gameId = gameId;
    socket.join(gameId);
    io.to(gameId).emit("user_joined", { user: socket.data.user });

    if (cb) cb();
  });

  // chat
  socket.on("send_message", (message: string) => {
    console.log("User sent message", message);
    io.to(socket.data.gameId).emit("receive_message", {
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
}
