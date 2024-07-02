import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import fileRoute from "./Route/fileRoute.js";
import FileProcessingRoute from "./Route/FileProcessingRoute.js";
import configDB from "./Database/db.js";
dotenv.config();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
configDB();
let corsOptions = {
  origin: ['http://localhost:3000/','http://localhost:3000']
}
app.use(cors(corsOptions));

app.use("/", fileRoute);
app.use("/test",FileProcessingRoute);

app.listen(process.env.PORT, (req, res) => {
  console.log("server running");
});
