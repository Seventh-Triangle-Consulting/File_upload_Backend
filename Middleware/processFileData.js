import FileData from "../Model/fileModel.js";

export const processFileData = async (req, res) => {
    console.log("processData");
  try {
    // const { id: discountId } = req.query;
    // if (!discountId) {
    //   return res.status(400).json({ error: "Missing required query parameter: id" });
    // }
    const data = req.fileData;
    if (!data) {
      return res.status(400).json({ error: "No data found in file" });
    }
    // const newData = {
    //   discountId,
    //   discountCodes: data,
    // };

    //database insertmany
    const insertData = async (newData) => {
      try {
        await FileData.insertMany(newData);
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

    await insertData(req.fileData);

    res.status(200).json({
      message: "File processed and data inserted successfully",
      data,
    });

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

    res.status(500).json({ error: errorMessage });
  }
};
