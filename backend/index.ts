import express from "express";
import http from "http";
import { Server } from "socket.io";
import gameRoutes from "./routes/gameRoutes";
import { setupGameSocket } from "./sockets/gameSocket";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// test route
app.get("/api/ping", (req: any, res: any) => {
  res.send("pong");
});

// express routes
app.use("/api/game", gameRoutes);

// socket.io logic
// auth
io.use((socket, next) => {
  socket.data.user = "ghtjason";
  next();

  // TODO: auth logic below
  // const token = socket.handshake.auth.token;
  // if (token) {
  //   // verify token logic here
  //   next();
  // } else {
  //   next(new Error("Authentication error"));
  // }
});
io.on("connection", (socket) => setupGameSocket(io, socket));

// startup
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
