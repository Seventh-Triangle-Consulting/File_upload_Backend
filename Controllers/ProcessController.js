import FileStatus from "../Model/FileStatusModel.js";
import FileData from "../Model/fileModel.js";

export const timerObj = {
  timer: null
};

export const startFileProcessing = async (req, res) => {
  try {
    const { id: userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'Missing userId' });
    }

    let fileStatus = await FileStatus.findOne({ userId });
    if (!fileStatus) {
      return res.status(404).json({ message: 'File not found' });
    }

    fileStatus.processing = true;
    fileStatus.startTime = new Date();
    fileStatus = await fileStatus.save();

    let page = 0;
    let nextPage = true;
    let processedData;

    const interval = setInterval(async () => {
      console.log('Hi hi hi');
      page = page + 1;
      if (nextPage) {
        processedData = await getDesiredDiscountCodes(userId, page);
        if (!processedData.nextPage) nextPage = false;
        console.log(processedData.result);
        console.log(processedData.result.discount_codes);
        console.log(processedData.page, processedData.nextPage);
        timerObj.timer = (Math.ceil(processedData.result.discount_codes.length / 90) * 1200);
      }
      else {
        console.log("File chunks processed.")
        clearInterval(interval);
      }
    }, 60000);


    // Simulate processing
    setTimeout(async () => {
      fileStatus.processing = false;
      await fileStatus.save();
      console.log("File chunks processed.");
      console.log("fileStatus.processing", fileStatus.processing);
      clearInterval(interval);
    }, timerObj.timer);

    return res.status(200).json({ result: fileStatus, message: 'File processing started' });
  } catch (error) {
    return res.send(error);
  }
};


const getDesiredDiscountCodes = async function (userId, page) {
  try {
    let limit = 100; // 100 queries
    const skip = (page - 1) * limit;

    const result = await FileData.findOne({ userId })
      .select("discountCodes")
      .exec();

    const { discountCodes } = result;
    const totalCodes = discountCodes.length;
    const totalPages = Math.ceil(totalCodes / limit);

    const paginatedDiscountCodes = discountCodes.slice(skip, skip + limit);

    let codes = paginatedDiscountCodes.map(x => {
      let value = Object.values(x)[0];
      return new Object({ code: value });
    });
    let discount_codes = new Object({ discount_codes: codes });



    const data = {
      page: page,
      totalPages,
      result: discount_codes,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };

    return data;

  } catch (error) {
    console.log(error);
  }
}