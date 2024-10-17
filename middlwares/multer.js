const multer = require('multer');

// Use multer memory storage to process images as a buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload