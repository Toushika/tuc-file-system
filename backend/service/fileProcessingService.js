const multer = require('multer');
const mongoose = require('mongoose');
var stream = require('stream');
const crypto = require('crypto');
const axios = require('axios')
const FileModel = require("../model/fileModel");

// for saving on a directory

// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {

//         // Uploads is the Upload_folder_name
//         cb(null, "./images")
//     },
//     filename: function (req, file, cb) {
//         cb(null,  Date.now() + "-" + file.originalname)
//     }
// })

const storage = multer.memoryStorage();
const upload = multer({ storage: storage })



const saveFile = (file, userId) => {
    const fileSizeInMb = (file.size / (1024 * 1024)).toFixed(3);
    let fileInfo = new FileModel({
        fileName: file.originalname,
        fileSize: fileSizeInMb,
        createdAt: Date.now(),
        fileData: {
            fileBuffer: file.buffer,
            contentType: file.mimetype
        },
        userId: userId
    });

    fileInfo.save((data, error) => {
        if (error) {
            console.log(error);
        }
    })
}

const saveMultipleFile = (req) => {
    Promise.all(
        req.files.map(async (file) => {
            saveFile(file);
        })
    )
}

const checkForDownloadFile = (req, res) => {
    FileModel.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) }, (err, data) => {
        var fileContents = Buffer.from(data.fileData.fileBuffer, "base64");
        checkBlockListed(fileContents, data, req, res);
    })
}

const checkBlockListed = (fileContents, data, req, res) => {
    const sha256File = convertFileToSha256(fileContents);
    console.log("sha256File :: " + sha256File);

    axios.get('https://www.tu-chemnitz.de/informatik/DVS/blocklist/' + sha256File, {
        auth: {
            username: "islt",
            password: "Smaug16+",
        }
    }).then((response) => {
        if (response.status == 200) {
            downloadFile(fileContents, data, req, res);
        } else {
            console.log("the file is not downloadable")
        }
    });
}

const convertFileToSha256 = (fileContents) => {
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileContents);
    const sha256File = hashSum.digest('hex');
    return sha256File;

}


const downloadFile = (fileContents, data, req, res) => {
    if (req.body.userId != undefined || req.body.userId != null) {
    var readStream = new stream.PassThrough();
    readStream.end(fileContents);

    res.set('Content-disposition', 'attachment; filename=' + data.fileName);
    res.set('Content-Type', data.fileData.contentType);

    readStream.pipe(res);
    } else {
        //minimize the  download speed
        console.log("file can not be downloaded");
    }
}

const blockFile = (fileContents, data, res) => {
    const sha256File = convertFileToSha256(fileContents);
    console.log("sha256File :: " + sha256File);

    axios.put(
        "https://www.tu-chemnitz.de/informatik/DVS/blocklist/",
        { hash: sha256File },
        { auth: { username: "islt", password: "Smaug16+", } }
    )
        .then(r => console.log(r.status))
        .catch(e => console.log(e));
}

module.exports = { upload, saveFile, saveMultipleFile, checkForDownloadFile };