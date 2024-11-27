const multer = require("multer");

// Use memoryStorage for multer
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
