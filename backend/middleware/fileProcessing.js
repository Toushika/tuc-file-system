const crypto = require('crypto');

const getConvertedFile = (fileBuffer) => {
    return Buffer.from(fileBuffer, "base64");
}

const convertFileToSha256 = (file) => {
    const hashSum = crypto.createHash('sha256');
    hashSum.update(file);
    const sha256File = hashSum.digest('hex');
    return sha256File;
}
module.exports = { getConvertedFile, convertFileToSha256 }
