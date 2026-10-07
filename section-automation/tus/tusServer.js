const path = require("path");
const { Server } = require("@tus/server");
const { FileStore } = require("@tus/file-store");

const uploadDir = path.join(__dirname, "../../tmp-uploads");

const tusServer = new Server({
    path: "/api/tus",

    datastore: new FileStore({
        directory: uploadDir,
    }),
});

module.exports = tusServer;