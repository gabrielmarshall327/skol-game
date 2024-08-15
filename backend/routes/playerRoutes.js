import express from "express";
import { Player } from "../models/playerModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const players = await Player.find({}).sort({ Name: 1 });
    return res.status(200).json(players);
  } catch (error) {
    console.error("Error fetching products", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/random", async (req, res) => {
  try {
    const count = await Player.countDocuments();
    const random = Math.floor(Math.random() * count);
    const randomPlayer = await Player.findOne().skip(random);
    return res.status(200).json(randomPlayer);
  } catch (error) {
    console.error("Error fetching random player", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
