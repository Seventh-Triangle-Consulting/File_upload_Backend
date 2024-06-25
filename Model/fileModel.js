import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
    trim: true,
  },
  discountCodes: {
    type: Object,
    required: true,
  },
});

const FileData = mongoose.model("Filecode", FileSchema);
export default FileData;
