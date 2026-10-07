const express = require("express");

const router = express.Router();

const upload = require("../middleware/fileUpload.middleware");
const controller = require("../controllers/file.controller");

const {
  requireLogin,
} = require("../middleware/auth.middleware");

// CREATE ZIP
router.post(
  "/upload",
  upload.array("files", 1000),
  controller.uploadFiles
);

// PUBLIC DOWNLOAD
router.get(
  "/:companySlug/:divisionSlug/:individualSlug/:projectSlug",
  controller.downloadFiles
);

router.get(
  "/dashboard",
  controller.getFileDashboardData
);

// CHECK IF ZIP EXISTS
router.get(
  "/check",
  controller.checkZipExists
);

module.exports = router;