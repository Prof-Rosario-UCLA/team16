import { Server, Socket } from "socket.io";

export function setupGameSocket(io: Server, socket: Socket) {
  // joining a room
  socket.on("join_room", (roomId: string) => {
    socket.data.roomId = roomId;
    socket.join(roomId);
    socket.to(roomId).emit("user_joined", { userId: socket.id });
  });

  // chat
  socket.on("send_message", (message: string) => {
    socket
      .to(socket.data.roomId)
      .emit("receive_message", { message, userId: socket.id });
  });

  socket.on("disconnect", () => {
    // handle user disconnect
  });
}
