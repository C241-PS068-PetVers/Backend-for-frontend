const multer = require('multer');
const { Storage } = require('@google-cloud/storage');

// Google Cloud Storage and Multer configuration
const storage = new Storage({
  keyFilename: '../serviceAccountKey.json'
});

// Replace 'your-bucket-name' with your actual GCP bucket name
const bucket = storage.bucket('storage-imagebucket');

const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

module.exports = { upload, bucket };
