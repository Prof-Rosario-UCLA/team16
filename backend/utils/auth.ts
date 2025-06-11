import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req: any, res: any, next: any) => {
  const token = req.signedCookies?.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Unauthorized: Token expired" });
      }
      return res.status(403).json({ error: "Unauthorized: Invalid token" });
    }
    req.user = decoded;
    next();
  });
};
