const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

class MulterStorageConfig {
  constructor(destinationPath = 'uploads/templ') {
    this.destinationPath = destinationPath;
  }

  getStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.destinationPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
        const fileExtension = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${fileExtension}`);
      },
    });
  }
}

module.exports = MulterStorageConfig;
