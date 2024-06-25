import path from 'path';
import { handleXlsx , handleCsv } from '../Middleware/decodeFile.js';
import FileData from '../Model/fileModel.js';

export const uploadFile = async (req, res , next) => {
  
  try {
    if (!req.file) {
      return res.status(400).send({ error: "File not found" });
    }
    const filePath = path.resolve(req.file.path);
    const fileType = path.extname(req.file.originalname).toLowerCase();
    if (fileType === ".csv") {
        handleCsv(req,res,next);
    } else if (fileType === ".xlsx" || fileType === ".xls") {
       handleXlsx(req,res,next);
    } else {
      res
        .status(400)
        .send("Unsupported file type. Only accepts .csv/.xlsx/.xls file type.");
    }
  } catch (error) {
    console.log("uploadFile", error);
  }
};

export const queryResult = async (req , res) => {

  try {
    const userId = parseInt(req.query.id, 10);
    let { page, limit } = req.query;
    if (!userId) {
      return res
        .status(400)
        .json({ error: "Missing required query parameter: id" });
    }
    
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;
    
    const result = await FileData.findOne({ userId })
    .select('discountCodes') // Select only the discountCodes array
    .exec();

    console.log("result",result);

  if (!result) {
    return res.status(404).json({ error: "File data not found for the given userId." });
  }

  const { discountCodes } = result;
  const totalCodes = discountCodes.length;
  const totalPages = Math.ceil(totalCodes / limit);

  // Slice the discountCodes array to get the current page's items
  const paginatedDiscountCodes = discountCodes.slice(skip,  skip+limit);

  // Prepare paginated response with pagination metadata and sliced discountCodes
  const paginatedResponse = {
    userId,
    page: page,
    limit: limit,
    totalCodes,
    totalPages,
    discountCodes: paginatedDiscountCodes,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };

  res.status(200).json({result:paginatedResponse});
    
  } catch (error) {
    console.log("queryResult",queryResult);
    res.status(500).json(error);
  }
}


