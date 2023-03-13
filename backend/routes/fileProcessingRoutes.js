const express = require("express");
const fileProcessingController = require("../controller/fileProcessingController");
const fileProcessingService = require("../service/fileProcessingService");
const auth = require('../middleware/auth');
const multer = require('../middleware/multer');
const rateLimiter = require('../middleware/rateLimiter');
const router = express.Router();

router.post("/upload-single-file", multer.upload.single('file'), auth, fileProcessingController.upload_single_file);
router.post("/upload-multiple-file", multer.upload.array('files'), auth, fileProcessingController.upload_multiple_files);
router.post("/download-file/", fileProcessingController.download_file_by_file_id);
router.post("/generalfile/", rateLimiter, fileProcessingController.download_generalfile_by_file_id);
router.get("/view-files", fileProcessingController.view_all_files);
router.post("/view-my-files", auth, fileProcessingController.view_all_files_by_user);
router.post("/delete-file", fileProcessingController.delete_file_by_file_id);
// router.post("/inactive-file", fileProcessingController.inactive_file);

module.exports = router;