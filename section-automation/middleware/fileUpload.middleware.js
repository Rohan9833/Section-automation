const path = require("path");
const fs = require("fs");
const multer = require("multer");

const TEMP_UPLOAD_DIR = path.join(__dirname, "../../tmp-uploads");
// ensure it exists
fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, TEMP_UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024,
    files: 1000,
  },
});



module.exports = upload;