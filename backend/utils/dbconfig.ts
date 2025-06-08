import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

// connect to mongodb
export const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("connected to mongodb");
    return true;
  } catch (error: any) {
    console.log(error);
    return false;
  }
};
