import { Test } from "../models/testModel";
import asyncHandler from "express-async-handler"

export const getTest = asyncHandler(async (req: any, res: any) => {
  const test = await Test.findOne({});
  res.send(test);
});