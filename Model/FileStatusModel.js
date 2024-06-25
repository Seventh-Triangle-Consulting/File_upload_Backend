import mongoose from "mongoose";

const FileStatusSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    unique: true,
    trim: true,
  },
  processing: {
    type: Boolean,
    default: false,
    required:true
  },
  startTime: {
    type: Date,
    required:true,
    default: Date.now,
  },
  processTime: {
    type: Number,
    required:true,
    default: 0,
  }
});

const FileStatus = mongoose.model("FileStat", FileStatusSchema);
export default FileStatus;
