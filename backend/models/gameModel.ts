import mongoose, { Schema } from "mongoose";

const gameSchema = new Schema(
  {
    gameId: { type: String, required: true, unique: true },
    players: {
      type: [
        {
          username: { type: String },
          points: { type: Number },
          placement: { type: Number },
        },
      ],
      default: [],
    },
    numRounds: { type: Number, default: 0 },
    winner: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "in_progress", "finished"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Game = mongoose.model("Game", gameSchema, "games");
