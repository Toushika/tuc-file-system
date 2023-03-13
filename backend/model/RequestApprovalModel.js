const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RequestApprovalSchema = new Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    fileId: { type: String, required: true },
    fileName: { type: String, required: true },
    blockStatus: { type: Boolean, required: true },
    reason: { type: String, required: true },
    createdAt: { type: Date },
    actionTaken: { type: Boolean }

});
module.exports = mongoose.model("RequestApproval", RequestApprovalSchema, "request-approval");
