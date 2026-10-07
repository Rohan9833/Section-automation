const { getProducts } = require("../utils/product.utils");
const VideoLink = require("../models/video.model")
const fs = require("fs");
const path = require("path");
exports.getProducts = (req, res) => {
  try {
    const products = getProducts();

    return res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Failed to get video products:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get video products",
    });
  }
};

exports.generateVideoLink = async (req, res) => {
  try {
    const {
      companyName,
      divisionName,
      individualName,
      projectName,
      productSlug,
      active,
      expiration,
    } = req.body;

    // 1. Validate input
    if (
      !companyName ||
      !divisionName ||
      !individualName ||
      !projectName ||
      !productSlug
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company name, division name, individual name, project name and product slug are required",
      });
    }

    // 2. Find product
    const products = getProducts();

    const product = products.find(
      (item) => item.slug === productSlug.toLowerCase()
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 3. Create slugs
    const companySlug = companyName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const divisionSlug = divisionName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const individualSlug = individualName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const projectSlug = projectName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    // 4. Generate URL
    const url =
      `/video/${companySlug}/` +
      `${divisionSlug}/` +
      `${individualSlug}/` +
      `${projectSlug}/` +
      `${product.slug}/`;

    // 5. Check if this URL already exists
    const existingVideoLink = await VideoLink.findOne({
      url,
    });

    if (existingVideoLink) {
      return res.status(409).json({
        success: false,
        message: "This video link already exists",
        url: existingVideoLink.url,
      });
    }

    let expiresAt = null;

    if (expiration === "1-day") {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);
    }

    if (expiration === "7-days") {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
    }

    if (expiration === "30-days") {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
    }

    // 6. Save to MongoDB
    const videoLink = await VideoLink.create({
      companyName,
      companySlug,

      divisionName,
      divisionSlug,

      individualName,
      individualSlug,

      projectName,
      projectSlug,

      productName: product.name,
      productSlug: product.slug,

      url,

      active: active !== false,

      expiresAt,

      viewCount: 0,

      lastSeenAt: null,
    });

    // 7. Return result
    return res.status(201).json({
      success: true,

      message: "Video link generated successfully",

      url: videoLink.url,

      videoLink: {
        id: videoLink._id,

        companyName: videoLink.companyName,
        divisionName: videoLink.divisionName,
        individualName: videoLink.individualName,
        projectName: videoLink.projectName,

        productName: videoLink.productName,
        productSlug: videoLink.productSlug,

        active: videoLink.active,
      },
    });

  } catch (error) {
    console.error("Failed to generate video link:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate video link",
    });
  }
};

exports.serveVideo = async (req, res) => {
  try {
    const {
      companySlug,
      divisionSlug,
      individualSlug,
      projectSlug,
      productSlug,
    } = req.params;

    console.log("Video request:", {
      companySlug,
      divisionSlug,
      individualSlug,
      projectSlug,
      productSlug,
    });


    const videoLink = await VideoLink.findOne({
      companySlug,
      divisionSlug,
      individualSlug,
      projectSlug,
      productSlug,
    });

    if (!videoLink) {
      return res.status(404).send("Video link not found");
    }

    if (!videoLink.active) {
      return res.status(403).send("This video link is inactive");
    }

    if (
      videoLink.expiresAt &&
      new Date() > videoLink.expiresAt
    ) {
      return res.status(403).send("This video link has expired");
    }

    const productDir = path.join(
      __dirname,
      "../../products"
    );

    const products = fs.readdirSync(productDir, {
      withFileTypes: true,
    });

    const productFolder = products.find(
      (entry) =>
        entry.isDirectory() &&
        entry.name.toLowerCase() === productSlug.toLowerCase()
    );

    if (!productFolder) {
      return res.status(404).send("Product not found");
    }


    const htmlPath = path.join(
      productDir,
      productFolder.name,
      "video.html"
    );

    if (!fs.existsSync(htmlPath)) {
      return res.status(404).send("Video HTML file not found");
    }

    // Track view
    videoLink.viewCount += 1;
    videoLink.lastSeenAt = new Date();

    await videoLink.save();

    console.log("Serving:", htmlPath);
    console.log("HTML EXISTS:", fs.existsSync(htmlPath));

    return res.sendFile(htmlPath, (error) => {
      if (error) {
        console.error("❌ sendFile ERROR:", error);
      } else {
        console.log("✅ HTML FILE SENT SUCCESSFULLY");
      }
    });

  } catch (error) {
    console.error("Failed to serve video:", error);

    return res.status(500).send(
      "Failed to load video"
    );
  }
}

exports.updateVideoSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { active, expiration } = req.body;

    console.log("UPDATE VIDEO SETTINGS");
    console.log("ID:", id);
    console.log("BODY:", req.body);

    if (active !== undefined && typeof active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "active must be a boolean",
      });
    }

    const allowedExpirations = [
      "no-expiration",
      "1-day",
      "7-days",
      "30-days",
    ];

    if (
      expiration !== undefined &&
      !allowedExpirations.includes(expiration)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid expiration value",
      });
    }

    const videoLink = await VideoLink.findById(id);

    if (!videoLink) {
      return res.status(404).json({
        success: false,
        message: "Video link not found",
      });
    }

    // Update active status
    if (active !== undefined) {
      videoLink.active = active;
    }

    // Update expiration
    if (expiration !== undefined) {
      let expiresAt = null;

      if (expiration === "1-day") {
        expiresAt = new Date();
        expiresAt.setDate(
          expiresAt.getDate() + 1
        );
      }

      if (expiration === "7-days") {
        expiresAt = new Date();
        expiresAt.setDate(
          expiresAt.getDate() + 7
        );
      }

      if (expiration === "30-days") {
        expiresAt = new Date();
        expiresAt.setDate(
          expiresAt.getDate() + 30
        );
      }

      if (expiration === "no-expiration") {
        expiresAt = null;
      }

      videoLink.expiresAt = expiresAt;
    }

    await videoLink.save();

    console.log("UPDATED VIDEO:", {
      active: videoLink.active,
      expiresAt: videoLink.expiresAt,
    });

    return res.json({
      success: true,
      message: "Video settings updated successfully",
      videoLink: {
        id: videoLink._id,
        url: videoLink.url,
        active: videoLink.active,
        expiresAt: videoLink.expiresAt,
      },
    });

  } catch (error) {
    console.error(
      "Failed to update video settings:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update video settings",
    });
  }
};

exports.getAllVideoLinks = async (req, res) => {
  try {
    const videoLinks = await VideoLink.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: videoLinks.length,
      videoLinks,
    });

  } catch (error) {
    console.error(
      "Failed to get video links:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get video links",
    });
  }
};