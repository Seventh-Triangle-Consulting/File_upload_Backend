import FileData from "../Model/fileModel.js";

export const testConnectorFunction = async (req, res , next) => {
  try {
    console.log("Test Function... BBYEE");
    // console.log(req.query);
    const userId = parseInt(req.query.id, 10);
    let { page, limit } = req.query;
    if (!userId) {
      return res
        .status(400)
        .json({ error: "Missing required query parameter: id" });
    }
    page = parseInt(page) || 1;
    limit = 100; //--default 100queriers
    const skip = (page - 1) * limit;

    const result = await FileData.findOne({ userId })
      .select("discountCodes") // Select only the discountCodes array
      .exec();
    // console.log("result", result);

    const { discountCodes } = result;
    const totalCodes = discountCodes.length;
    const totalPages = Math.ceil(totalCodes / limit);

    const paginatedDiscountCodes = discountCodes.slice(skip, skip + limit);
    
    let codes = paginatedDiscountCodes.map(x=> {
        let value = Object.values(x)[0];
        return new Object({ code: value });
    });
    let discount_codes = new Object({discount_codes:codes});

    next();

    // Prepare paginated response with pagination metadata and sliced discountCodes
    const paginatedResponse = {
      userId,
      page: page,
      limit: limit,
      totalCodes,
      totalPages,
      discountCodes: paginatedDiscountCodes,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };

    
  } catch (error) {
    console.log("testConnectorFunction", error);
    res.status(500).json(error);
  }
};
