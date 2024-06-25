import mongoose from "mongoose";

const configDB = () => {
  mongoose.Promise = global.Promise;
  mongoose
    .connect(`${process.env.DB_STRING}`, {
      dbName:"FileCodeData",
    })
    .then(() => {
      console.log("Connection established with database");
    })
    .catch((err) => {
      console.log("Error in connection :", err);
    });
};
export default configDB;