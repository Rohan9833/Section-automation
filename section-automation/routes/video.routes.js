const express = require("express");

const router = express.Router();

const {
  getProducts,
  generateVideoLink,
  serveVideo,
  updateVideoSettings,
  getAllVideoLinks,
} = require("../controllers/video.controller");

console.log("🔥 VIDEO ROUTES LOADED");

router.get("/", getProducts);

router.post("/generate", (req, res) => {
  console.log("🔥 POST /generate ROUTE HIT");
  return generateVideoLink(req, res);
});

router.get(
  "/video/:companySlug/:divisionSlug/:individualSlug/:projectSlug/:productSlug/",
  serveVideo
);

router.patch(
  "/video/:id/settings",
  updateVideoSettings
);

router.get(
  "/video-links",
  getAllVideoLinks
);

module.exports = router;