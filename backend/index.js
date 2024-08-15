import express from "express";
import mongoose from "mongoose";
import playersRoute from "./routes/playerRoutes.js";
import cors from "cors";

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(port, () => {
      console.log(`App running on port ${port}.`);
    });
  })
  .catch((error) => {
    console.log(error);
  });

app.use('/players', playersRoute);
