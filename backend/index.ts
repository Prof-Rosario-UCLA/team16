import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import gameRoutes from "./routes/gameRoutes";
import testRoutes from "./routes/testRoutes";
import loginRoutes from "./routes/loginRoutes";
import userRoutes from "./routes/userRoutes";
import wordRoutes from "./routes/wordRoutes";
import cors from "cors";
import { Server } from "socket.io";
import { setupGameSocket } from "./sockets/gameSocket";
import { connectToMongoDB } from "./utils/dbconfig";
import { verifyToken } from "./utils/auth";
import cookieParser from "cookie-parser";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);
const origin =
  process.env.NODE_ENV === "production"
    ? "https://team16.cs144.org"
    : "http://localhost:3000";
const io = new Server(server, {
  cors: { origin, credentials: true },
  path: "/ws",
});

const corsOptions = {
  origin,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || "default"));

app.use((err: any, req: any, res: any, next: any) => {
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

app.use("/api/login", loginRoutes);
app.get("/", (_, res) => {
  res.status(200).send("ok");
});

app.use("/api/word", wordRoutes); // only sending from backend

app.use(verifyToken); // apply auth middleware to all routes below this line

// express routes
app.use("/api/user", userRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/test", testRoutes);

// socket.io logic
// auth
io.use((socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) {
    return next(new Error("No cookies found"));
  }

  const parsedCookies = cookie.parse(cookieHeader);
  const filteredCookies: { [key: string]: string } = {};
  for (const [key, value] of Object.entries(parsedCookies)) {
    if (typeof value === "string") {
      filteredCookies[key] = value;
    }
  }

  const cookies = cookieParser.signedCookies(
    filteredCookies,
    process.env.COOKIE_SECRET || "default"
  );
  const token = cookies.token;
  if (!token) {
    return next(new Error("Token not found or invalid"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "username" in decoded
    ) {
      socket.data.user = (decoded as jwt.JwtPayload).username;
      console.log("Authenticated user:", socket.data.user);
      next();
    } else {
      return next(new Error("Invalid token payload: username missing"));
    }
  } catch (err) {
    console.error("Token verification failed:", err);
    next(new Error("Unauthorized: Invalid token"));
  }
});

io.on("connection", (socket) => setupGameSocket(io, socket));

// startup
const main = async () => {
  await connectToMongoDB();

  const PORT = process.env.PORT;
  server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
};

main().catch((err) => {
  console.error("Failed to start server:", err);
});
