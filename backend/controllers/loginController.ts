import { User } from '../models/userModel';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const registerUser = asyncHandler(async (req: any, res: any) => {
  const { username, password } = req.body;

  // validate username length
  if (typeof username !== 'string' || username.length > 12) {
    return res.status(400).json({ message: 'Username must be 12 characters or fewer' });
  }

  // check if user exists
  const existingUser = await User.findOne({ username: username });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = new User({ 
    username: username,
    password: hashPassword // store hashed password
  });
  await user.save();
  res.status(200).json({ message: "Successfully registered" });
});

export const loginUser = asyncHandler(async (req: any, res: any) => {
  const { username, password } = req.body;

  // check if user exists
  const user = await User.findOne({ username: username });
  if (!user) {
    return res.status(400).json({ message: 'Invalid username' });
  }

  // check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid password' });
  }

  const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET as string);

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'Strict',
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

  res.status(200).json({ message: "Successfully logged in" });
});

export const logoutUser = asyncHandler(async (req: any, res: any) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'Strict',
    signed: true,
    secure: process.env.NODE_ENV === 'production'
  });
  res.status(200).json({ message: "Successfully logged out" });
});