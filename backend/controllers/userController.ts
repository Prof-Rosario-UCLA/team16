import { User } from '../models/userModel';
import asyncHandler from 'express-async-handler';

export const getUser = asyncHandler(async (req: any, res: any) => {
  const user = await User.findOne();
});

export const createUser = asyncHandler(async (req: any, res: any) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  await user.save();
  res.status(201).json(user);
});