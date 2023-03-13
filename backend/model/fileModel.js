const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// var User = require('./userModel').schema;

const FileInfoSchema = new Schema({
  fileName: { type: String },
  fileSize: { type: Number },
  createdAt: { type: Date },
  fileData:
  {
    fileBuffer: { type: Buffer },
    contentType: { type: String }
  },
  // user: User
  userId: { type: String },
  blockStatus: { type: Boolean},
  reason: { type: String},
  blockStatusRequesterId: {type: String},
  blockStausUpdatedAt: { type: Date },
  lasDownloadedAt:{type : Date}
})

module.exports = mongoose.model("File_Info", FileInfoSchema, "file_info");