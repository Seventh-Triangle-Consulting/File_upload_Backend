import express from "express";
import multer from "multer";
import path from 'path';
import { checkId } from "../Middleware/checkId.js";
import { processFileData } from "../Middleware/processFileData.js";
import { uploadFile } from "../Controllers/FileController.js";
import { queryResult } from "../Controllers/FileController.js";
import { startFileProcessing } from "../Controllers/ProcessController.js";
import { checkFileStatus } from "../Controllers/StatusController.js";
const fileRoute = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

fileRoute.post("/file", checkId, upload.single("file"), uploadFile );
fileRoute.get("/file/processing", startFileProcessing);
fileRoute.get("/file/status",checkFileStatus);
fileRoute.get("/file/data", checkId , queryResult);

export default fileRoute;
