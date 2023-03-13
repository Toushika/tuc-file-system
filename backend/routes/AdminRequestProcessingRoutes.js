const express = require("express");
const adminRequestHandlerController = require("../controller/adminRequestHandlerController");
const router = express.Router();

router.post("/send-request-admin-file-block-unblock", adminRequestHandlerController.send_request_admin_file_block_unblock);
router.get("/view-requests", adminRequestHandlerController.view_requests);
router.post("/approve-block-request", adminRequestHandlerController.approve_block_Request);
router.post("/approve-unblock-request", adminRequestHandlerController.approve_Unblock_Request);
router.post("/reject-request", adminRequestHandlerController.reject_request);
router.post("/process-to-get-sha256-hash-file", adminRequestHandlerController.process_to_get_sha256_hash_file);
//router.post("/getHashRequest", adminRequestHandlerController.getHashStatus);

module.exports = router;