import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    stats: {
      gamesPlayed: { type: Number, default: 0 },
      totalPoints: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);
userSchema.index({ "stats.wins": -1 });
userSchema.index({ "stats.totalPoints": -1 });
userSchema.index({ "stats.gamesPlayed": -1 });

export const User = mongoose.model("User", userSchema, "users");
