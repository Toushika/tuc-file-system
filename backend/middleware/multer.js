const multer = require('multer');
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
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
})

module.exports = { upload }