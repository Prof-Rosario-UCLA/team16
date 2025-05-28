import { User } from "../models/userModel";
import asyncHandler from "express-async-handler"

export const getCurrentUser = asyncHandler(async (req: any, res: any) => {
  if (!req.user) {
    return res.status(401).json({ message: "No authorized user exists" });
  }

  const user = await User.findOne({ username: req.user.username }).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(user);
});