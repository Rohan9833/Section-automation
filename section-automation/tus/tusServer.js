const path = require("path");
const { Server } = require("@tus/server");
const { FileStore } = require("@tus/file-store");
const fs = require("fs");

const uploadDir =
  process.env.TUS_UPLOAD_DIR ||
  path.join(__dirname, "../../tmp-uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const tusServer = new Server({
  path: "/api/tus",
  datastore: new FileStore({
    directory: uploadDir,
  }),
});

module.exports = tusServer;
