import xlsx from "xlsx";
import csv from "csv-parser";
import fs from "fs";
import path from "path";
import FileData from "../Model/fileModel.js";

export const handleXlsx = async (req, res) => {
  const filePath = path.resolve(req.file.path);
  try {
    const { page, limit } = req.query;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // check file data format
    const cellA1 = sheet["A1"];
    console.log(cellA1.v.toLowerCase(),"checking first header")

    if (cellA1 && cellA1.v && cellA1.v.toLowerCase() === "code") {
      console.log("First column, first row contains 'code'.");
      
    } else {
      console.log("Error: First column, first row does not contain 'code'.");
      return res.status(400).json({
        error: "Invalid file data format",
        message: "Invalid file data format. First column, first row does not contain 'code'.",
      });
    }

    console.log("XLSX data", data);
    console.log(req.query.id, "query");
    fs.unlinkSync(filePath);
    req.fileData = data;
    console.log("checkingdata", req.fileData);

    try {
      const { id: userId } = req.query;
      if (!userId) {
        return res
          .status(404)
          .json({ error: "Missing required query parameter: id" });
      }
      const data = req.fileData;
      if (!data) {
        return res.status(400).json({ error: "No data found in file" });
      }

      console.log(userId, "userid val...");

      const result = {
        userId,
        discountCodes: data,
      };

      //-- check in db and replace all or add new doc

      const insertData = async (result) => {
        try {
          await FileData.replaceOne({ userId: userId }, result, {
            upsert: true,
          });
          console.log("Documents inserted successfully");
        } catch (error) {
          console.error("Error inserting documents:", error);
          if (error.name === "ValidationError") {
            throw new Error("Schema validation error");
          } else if (error.name === "MongoNetworkError") {
            throw new Error("Database connection error");
          } else {
            throw new Error("Database insertion error");
          }
        }
      };

      await insertData(result);
      const params = new URLSearchParams(`id=${userId}`);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);
      res.redirect(`/file/data/?${params.toString()}`);

      //   return res.status(200).json({
      //     message: "File processed and data inserted successfully",
      //     result,
      //   });
    } catch (error) {
      console.log("processFileData", error.message);

      let errorMessage = "Failed to process file data";
      if (error.message.includes("Schema validation")) {
        errorMessage = "Data validation error: " + error.message;
      } else if (error.message.includes("connection")) {
        errorMessage = "Database connection error: " + error.message;
      } else if (error.message.includes("insertion")) {
        errorMessage = "Database insertion error: " + error.message;
      }

      return res.status(500).json({ error: errorMessage });
    }
  } catch (error) {
    console.error("Error reading XLSX file:", error);
    fs.unlinkSync(filePath); // Remove file after error
    return res.status(500).send("Error reading XLSX file.");
  }
};

export const handleCsv = (req, res) => {
  const filePath = path.resolve(req.file.path);
  const results = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      fs.unlinkSync(filePath);
      req.fileData = results;
      try {
        const { id: userId } = req.query;
        if (!userId) {
          return res
            .status(404)
            .json({ error: "Missing required query parameter: id" });
        }
        const data = req.fileData;

        if (!data) {
          return res.status(400).json({ error: "No data found in file" });
        }

        for (let obj of data) {
          if (typeof obj !== "object" || !obj.hasOwnProperty("code")) {
            console.log(
              "Error: First column, first row does not contain 'code'."
            );
            return res.status(400).json({
              error: "Invalid file data format",
              message: "Invalid file data format",
            });
          }
        }

        const result = {
          userId,
          discountCodes: data,
        };

        //database insertmany
        const insertData = async (result) => {
          try {
            await FileData.replaceOne({ userId: userId }, result, {
              upsert: true,
            });
            console.log("Documents inserted successfully");
          } catch (error) {
            console.error("Error inserting documents:", error);
            if (error.name === "ValidationError") {
              throw new Error("Schema validation error");
            } else if (error.name === "MongoNetworkError") {
              throw new Error("Database connection error");
            } else {
              throw new Error("Database insertion error");
            }
          }
        };

        await insertData(result);
        const params = new URLSearchParams(`id=${userId}`);
        if (page) params.append("page", page);
        if (limit) params.append("limit", limit);
        res.redirect(`/file/data?${params.toString()}`);

        // return res.status(200).json({
        //   message: "File processed and data inserted successfully",
        //   result,
        // });
      } catch (error) {
        console.log("processFileData", error.message);

        let errorMessage = "Failed to process file data";
        if (error.message.includes("Schema validation")) {
          errorMessage = "Data validation error: " + error.message;
        } else if (error.message.includes("connection")) {
          errorMessage = "Database connection error: " + error.message;
        } else if (error.message.includes("insertion")) {
          errorMessage = "Database insertion error: " + error.message;
        }

        return res.status(500).json({ error: errorMessage });
      }
    })
    .on("error", (error) => {
      console.error("Error reading CSV file:", error);
      fs.unlinkSync(filePath); // Remove file after error
      return res.status(500).send("Error reading CSV file.");
    });
};
