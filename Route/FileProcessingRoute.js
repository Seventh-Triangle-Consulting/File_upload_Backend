import express from "express";
import { testConnectorFunction } from "../Controllers/testConnectorFunction.js";
import { startFileProcessing } from "../Controllers/ProcessController.js";
const FileProcessingRoute = express.Router();

FileProcessingRoute.get('/testApi' , testConnectorFunction);

export default FileProcessingRoute;