import express from "express";
import mongoose from "mongoose";
import playersRoute from "./routes/playerRoutes.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`App running on port 5000.`);
    });
  })
  .catch((error) => {
    console.log(error);
  });

app.use('/players', playersRoute);
