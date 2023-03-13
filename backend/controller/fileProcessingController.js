const mongoose = require('mongoose');
var stream = require('stream');
const { ThrottleGroup } = require("stream-throttle");
const axios = require('axios');
const fileProcessing = require("../middleware/fileProcessing")
const FileModel = require("../model/fileModel");

const getCookies = require("../middleware/generateCookies");
const getBlockStatus = require("../middleware/getBlockStatus");
var tg = new ThrottleGroup({ rate: 100 * 1024 }); //1 MiB per sec
const uuidv4 = require('uuid').v4;
const nodeCron = require("node-cron");

uuidv4();
let stat = 0;
// uploading single file
exports.upload_single_file = (req, res) => {
    saveSingleFile(req.file, req.body.userId, res);
}

//upload multiple file in storage
exports.upload_multiple_files = (req, res) => {
    saveMultipleFile(req, res);
};

//view all files
exports.view_all_files = (req, res) => {
    FileModel.find({}, (error, file) => {
        res.send(file)
    })
};

//view all files by specific user
exports.view_all_files_by_user = (req, res) => {
    FileModel.find({ userId: req.body.userId }, (err, data) => {
        getCookies.generateCookies();
        res.send(data);
    })
};

// download file by file Id
exports.download_file_by_file_id = (req, res) => {
    console.log("download_file_by_file_id:: " + req.body.fileId);
    getFileContentsWithBlockListChecking(req, res);
};
exports.download_generalfile_by_file_id = (req, res) => {
    console.log("download_file_by_file_id:: " + req.body.fileId);
    // console.log(req.headers);
    // console.log(res.headers);
    //console.log(res.);
    getFileContentsWithBlockListCheckingGeneral(req, res);
};

// delete file by file Id
exports.delete_file_by_file_id = (req, res) => {
    console.log("delete_file_by_file_id:: " + req.body.fileId);
    FileModel.deleteOne({ _id: new mongoose.Types.ObjectId(req.body.fileId) }, (err, data) => {
        if (!err) {
            res.status(200).send("File has deleted successfully");
        }
        else {
            res.status(400).send("file deletion error ::" + err);
        }
    })
}

// Usefull methods

const saveSingleFile = (file, userId, res) => {
    let fileInfo = processFileInfo(file, userId);
    fileInfo.save()
        .then(data => {
            res.status(200).send("File has uploaded successfully into database");
        })
        .catch(err => {
            res.status(400).send("Unable to save file into database");
        });
}

const saveMultipleFile = (req, res) => {
    var userId = req.body.userId;
    Promise.all(
        req.files.map((file) => {
            let fileInfo = processFileInfo(file, userId);
            fileInfo.save();

        })).then(responses => {
            res.status(200).send("All files have been uploaded successfuly");
        }).catch(err => {
            res.status(400).send("Unable to save files into database");
        });

}

const processFileInfo = (file, userId) => {
    const fileSizeInMb = (file.size / (1024 * 1024)).toFixed(3);
    let fileInfo = new FileModel({
        fileName: file.originalname,
        fileSize: fileSizeInMb,
        createdAt: Date.now(),
        fileData: {
            fileBuffer: file.buffer,
            contentType: file.mimetype
        },
        userId: userId,
        blockStatus: false
    });
    return fileInfo;
}

const getFileContentsWithBlockListChecking = (req, res) => {
    FileModel.findOne({ _id: new mongoose.Types.ObjectId(req.body.fileId) }, (err, fileInfo) => {
        // console.log(JSON.stringify(fileInfo))
        var file = fileProcessing.getConvertedFile(fileInfo.fileData.fileBuffer);
        checkFileHashFoundOnBlockListServiceOrNot(file, fileInfo, req, res);
    })
}
const getFileContentsWithBlockListCheckingGeneral = (req, res) => {
    FileModel.findOne({ _id: new mongoose.Types.ObjectId(req.body.fileId) }, (err, fileInfo) => {
        // console.log(JSON.stringify(fileInfo))
        var file = fileProcessing.getConvertedFile(fileInfo.fileData.fileBuffer);
        checkFileHashFoundOnBlockListServiceOrNotGeneral(file, fileInfo, req, res);
    })
}

const checkFileHashFoundOnBlockListServiceOrNot = async (file, fileInfo, req, res) => {

    const sha256File = fileProcessing.convertFileToSha256(file);
   
    // 
    const BlockStatus = await getBlockStatus.getBlockStatus(sha256File, "GET");
    console.log("blockStatus:; " + BlockStatus);
    if (BlockStatus === 200) {
        processFileFordownload(file, fileInfo, req, res);
    } else {
        res.status(400).send("file can not be downloaded");
    }
}
const checkFileHashFoundOnBlockListServiceOrNotGeneral = async (file, fileInfo, req, res) => {

    const sha256File = fileProcessing.convertFileToSha256(file);
   
    // getCookies.generateCookies();
    const BlockStatus = await getBlockStatus.getBlockStatus(sha256File, "GET");
    console.log(BlockStatus);
    if (BlockStatus === 200) {
        processFileFordownloadGeneral(file, fileInfo, req, res);
    } else {
        res.status(400).send("file can not be downloaded The file block status is:" + BlockStatus);
    }
}

const processFileFordownload = (file, fileInfo, req, res) => {
    if (req.body.userId != undefined || req.body.userId != null) {
        var readStream = new stream.PassThrough();
        readStream.end(file);

        res.set('Content-disposition', 'attachment; filename=' + fileInfo.fileName);
        res.set('Content-Type', fileInfo.fileData.contentType);

        readStream.pipe(res);

        updateLastDownloadTime(fileInfo);

    } else {
        //minimize the  download speed
        res.status(400).send("file can not be downloaded");
    }
}
const processFileFordownloadGeneral = (file, fileInfo, req, res) => {
    if (req.body.userId != undefined || req.body.userId != null) {
        var readStream = new stream.PassThrough();
        readStream.end(file);

        res.set('Content-disposition', 'attachment; filename=' + fileInfo.fileName);
        res.set('Content-Type', fileInfo.fileData.contentType);

        // readStream.pipe(res);
        readStream.pipe(tg.throttle()).pipe(res);

        updateLastDownloadTime(fileInfo);
    } else {
        //minimize the  download speed
        res.status(400).send("file can not be downloaded");
    }
}

const updateLastDownloadTime = (fileInfo) => {

    FileModel.updateOne({ _id: new mongoose.Types.ObjectId(fileInfo._id) },
        {
            $set:
            {
                lasDownloadedAt: Date.now()
            }
        }, { upsert: true }).then((result, err) => {
            console.log("Download time has been added");
        })
}

// remove All inactive file
const inactiveFileDeleteJob = nodeCron.schedule("59 59 23 * * *", function jobYouNeedToExecute() {
    console.log("Running time :: " + new Date().toLocaleString());
    FileModel.find({}, (error, files) => {
        Promise.all(
            files.map(file => {
                //Do somethign with the user
                var fileCreatedOrLastDownloadDate;
                var currentDate;
                if (file.lasDownloadedAt === undefined) {
                    fileCreatedOrLastDownloadDate = file.createdAt;
                } else {
                    fileCreatedOrLastDownloadDate = file.lasDownloadedAt;
                }

                currentDate = new Date(Date.now());
                var Difference_In_Time = currentDate.getTime() - fileCreatedOrLastDownloadDate.getTime();
                var Difference_In_Days = Math.floor(Difference_In_Time / (1000 * 3600 * 24));
                console.log("Difference_In_Days :: " + Difference_In_Days)

                if (Difference_In_Days >= 14) {
                    deleteInactiveFile(file._id);
                }
            })
        );
    })
});


const deleteInactiveFile = (fileId) => {
    FileModel.remove({ _id: new mongoose.Types.ObjectId(fileId) }, function (err, result) {
        if (err) {
            console.log("err :: " + err);
        }
        console.log("Deleted inactive file:: " + JSON.stringify(result));
    });
}

const cookiesjob = nodeCron.schedule("*/30 * * * * ", function jobYouNeedToExecute() {
    // Do whatever you want in here. Send email, Make  database backup or download data.
    console.log(new Date().toLocaleString());
    getCookies.generateCookies();
});