const express = require("express");

const controller = require("../controllers/presentation.controller");

const router = express.Router();

router.get("/", controller.getPresentation);

router.post("/track-view", controller.trackView);

router.post("/update", controller.updatePresentation);

router.get("/status", controller.checkStatus);

router.post("/:id/toggle", controller.toggleActive);

router.patch("/:id/settings", controller.updateSettings);

module.exports = router;