import mongoose from "mongoose";

const playerSchema = mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Position: {
    type: String,
    required: true,
  },
  DraftYear: {
    type: Number,
    required: true,
  },
});

export const Player = mongoose.model("Player", playerSchema, "vikings");
