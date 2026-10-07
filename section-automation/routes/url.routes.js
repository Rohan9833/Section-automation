const express = require("express");

const controller = require("../controllers/url.controller");

const presentationController =
  require("../controllers/presentation.controller");

const router = express.Router();

router.get("/check", controller.checkUrlExists);

router.post("/generate", controller.generateUrl);

router.post("/track-view", controller.trackView);

router.get(
  "/status",
  presentationController.checkStatus
);

module.exports = router;