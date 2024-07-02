import FileStatus from "../Model/FileStatusModel.js";
import { timerObj } from "./ProcessController.js";

export const checkFileStatus = async (req, res) => {
  try {
    const { id: userId } = req.query;
    if (!userId) {
      console.log("Userid missing");
      return res.status(400).json({ message: "Missing userId" });
    }

    let fileStatus = await FileStatus.findOne({ userId });
    if (!fileStatus) {
      fileStatus = new FileStatus({ userId });
      fileStatus = await fileStatus.save();
      console.log("New FileStatus memory created for userId:", userId);
    }


    if (fileStatus.processing) {
      console.log("File is processing and checking timer");
      const elapsedTime = (new Date() - fileStatus.startTime) / 1000;
      console.log(elapsedTime, "elapsedTime");

      if (elapsedTime >= timerObj.timer) {
        fileStatus.processing = false;
        await fileStatus.save();
      }
    }

    console.log(
      {
        processing: fileStatus.processing,
        startTime: fileStatus.startTime
      }
    )
    res.json({
      result: fileStatus,
      processing: fileStatus.processing,
      startTime: fileStatus.startTime,
    });
  } catch (error) {
    console.log("STATUSCONTROLLER", error);
    return res.send(error);
  }
};


