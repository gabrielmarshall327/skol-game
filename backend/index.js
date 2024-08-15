import express from "express";
import { port, mongoDB_URL } from "./config.js";
import mongoose from "mongoose";
import playersRoute from "./routes/playerRoutes.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(mongoDB_URL)
  .then(() => {
    app.listen(port, () => {
      console.log(`App running on port ${port}.`);
    });
  })
  .catch((error) => {
    console.log(error);
  });

app.use('/players', playersRoute);
