import mongoose from "mongoose";

const { Schema } = mongoose;

const wordSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const Word = mongoose.model("Word", wordSchema, "words");