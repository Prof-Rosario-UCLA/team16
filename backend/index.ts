import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import http from "http";
import gameRoutes from "./routes/gameRoutes";
import testRoutes from "./routes/testRoutes";
import userRoutes from "./routes/userRoutes";
import cors from "cors";
import { Server } from "socket.io";
import { setupGameSocket } from "./sockets/gameSocket";
import { connectToMongoDB } from "./utils/dbconfig";
import { verifyToken } from "./utils/auth";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const corsOptions = {
  origin: "*", // change on deployment or rosario will be mad!
};
app.use(cors(corsOptions));
app.use(express.json());

// test route
app.get("/api/ping", (req: any, res: any) => {
  res.send("pong");
});

app.use("/api/user", userRoutes);

app.use(verifyToken); // apply auth middleware to all routes below this line

// express routes
app.use("/api/game", gameRoutes);
app.use("/api/test", testRoutes);

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
const main = async() => {
  await connectToMongoDB();

  const PORT = process.env.PORT;
  server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
});
