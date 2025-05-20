import express from "express";
import http from "http";
import { Server } from "socket.io";
import gameRoutes from "./routes/roomRoutes";
import { setupGameSocket } from "./sockets/gameSocket";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// test route
app.get("/api/ping", (req: any, res: any) => {
  res.send("pong");
});

// express routes
app.use("/api/room", gameRoutes);

// socket.io logic
io.on("connection", (socket) => setupGameSocket(io, socket));

// startup
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
