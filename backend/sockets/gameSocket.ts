import { Server, Socket } from "socket.io";

export function setupGameSocket(io: Server, socket: Socket) {
  // joining a game
  socket.on("join_game", (gameId: string) => {
    console.log("User joined game", gameId);
    socket.data.gameId = gameId;
    socket.join(gameId);
    socket.to(gameId).emit("user_joined", { username: socket.data.user });
  });

  // chat
  socket.on("send_message", (message: string) => {
    console.log("User sent message", message);
    socket
      .to(socket.data.gameId)
      .emit("receive_message", { message, username: socket.data.user });
  });

  socket.on("disconnect", () => {
    // handle user disconnect
  });
}
