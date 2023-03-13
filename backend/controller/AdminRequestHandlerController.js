const express = require("express");
const mongoose = require('mongoose');
const RequestApproval = require('../model/RequestApprovalModel');
const FileModel = require('../model/fileModel');
const fileProcessing = require('../middleware/fileProcessing')
const getCookies = require("../middleware/generateCookies");
const getBlockStatus = require("../middleware/getBlockStatus");
const deleteBlockStatus = require("../middleware/deleteBlockStatus");
//need to remove below file after update all



require('dotenv').config();

//send block or unblock request to admin
exports.send_request_admin_file_block_unblock = (req, res) => {
    let userRequest = new RequestApproval({
        userId: req.body.userId,
        userName:req.body.userName,
        fileId: req.body.fileId,
        fileName:req.body.fileName,
        blockStatus: req.body.blockStatus,
        reason: req.body.reason,
        actionTaken: false,
        createdAt: Date.now(),
    });
    userRequest.save().then(function (result) {
        console.log(result);
        res.status(200).send("Your request has been sent to admin successfully");

    }).catch(error => {
        res.status(500).json({
        });
    });
}

//view all request of user by admin
exports.view_requests = (req, res, next) => {
    RequestApproval.find({ actionTaken: false }, (error, data) => {
         console.log(data)
        res.status(200).send(data);
    })
}


exports.process_to_get_sha256_hash_file = (req, res) => {
    console.log("process_to_get_sha256_hash_file :: fileId :: " + req.body.fileId);
    FileModel.findOne({ _id: new mongoose.Types.ObjectId(req.body.fileId) }, (err, data) => {
        let file = fileProcessing.getConvertedFile(data.fileData.fileBuffer);
        let hash256File = fileProcessing.convertFileToSha256(file);
       // console.log("process_to_get_sha256_hash_file ::" + hash256File);
        res.status(200).send(hash256File);
    })
}

// aprove block file request
exports.approve_block_Request =  (req, res) => {
    getFileContentsWithBlockListChecking(req, res);
}

const getFileContentsWithBlockListChecking = (req, res) => {
    FileModel.findOne({ _id: new mongoose.Types.ObjectId(req.body.fileId) }, (err, fileInfo) => {
        var file = fileProcessing.getConvertedFile(fileInfo.fileData.fileBuffer);
        setBlockStatus(file, fileInfo, req, res);
    })
}
const setBlockStatus = async (file, fileInfo, req, res) => {
    const sha256File = fileProcessing.convertFileToSha256(file);
    // getCookies.generateCookies();
    //deleteBlockStatus
    const BlockStatus = await getBlockStatus.getBlockStatus(sha256File, "GET");
    // 200 OK
    if (BlockStatus === 200) {
        const hashBlocked = await getBlockStatus.getBlockStatus(sha256File, "PUT");
        if (hashBlocked === 201) {
            saveBlockingInfoInDB(req, res);
        }
        //processFileFordownloadGeneral(file, fileInfo, req, res);
    } else if (BlockStatus === 210) {
        const hashBlocked = await deleteBlockStatus.deleteBlock(sha256File);
        if (hashBlocked === 204) {
            saveBlockingInfoInDB(req, res);
        }
    } else {
        res.status(400).send("file can not be blocked");
      
    }
   
}
exports.approve_Unblock_Request = async (req, res) => {
    getFileContentsWithBlockListChecking(req, res);
}


exports.reject_request = (req, res) => {
    RequestApproval.deleteOne({ _id: new mongoose.Types.ObjectId(req.body.requestId) }, (err, data) => {
        if (!err) {
            res.status(200).send("User Request has been rejected successfully.");
        }
        else {
            res.status(400).send("User Request rejection error ::" + err);
        }
    })
}


const saveBlockingInfoInDB = (req, res) => {
    RequestApproval.updateOne({ _id: new mongoose.Types.ObjectId(req.body.id) }, {
        $set:
        {
            actionTaken: true,            
            actionDate: Date.now(),
           
        }
    }, { upsert: true }).then((result, err) => {
        
    })
    FileModel.updateOne({ _id: new mongoose.Types.ObjectId(req.body.fileId) },
        {
            $set:
            {
                blockStatus: req.body.blockStatus,
                reason: req.body.reason,
                blockStausUpdatedAt: Date.now(),
                blockStatusRequesterId: req.body.userId
            }
        }, { upsert: true }).then((result, err) => {
            if (req.body.blockStatus)
            {
                return res.status(201).send("File is blocked and saved in DB");
                
            } else {
                return res.status(204).send("File has been Unblocked and saved in DB");
            }
            
        })
}




