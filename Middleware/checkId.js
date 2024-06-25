export const checkId = (req, res, next) => {
    console.log("check id",req.query);
    const { id } = req.query;
    if (!id) {
      return res.status(404).json({ error: "Missing required query parameter: id" });
    }
    next();
  };
  