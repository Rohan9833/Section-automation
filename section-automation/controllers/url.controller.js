const fs = require("fs");
const path = require("path");
const slugify = require("../utils/slugify");
const { updateHtml } = require("../services/html.service");
const { updateJs } = require("../services/js.service");
const { writeLocationBlock, reloadNginx } = require("../utils/nginx.utils");
const Presentation = require("../models/presentation");
const { computeExpiresAt } = require("../utils/expiration.utils");

// Set these in .env on the server (see .env.example). Locally they fall
// back to sensible defaults so nothing breaks in dev.
const TEMPLATE_DIR =
  process.env.PPT_TEMPLATE_DIR || path.join(__dirname, "../../ppt-updated");
const LINKS_ROOT =
  process.env.PPT_LINKS_DIR || path.join(__dirname, "../../ppt-links");
const PUBLIC_DOMAIN = process.env.PUBLIC_DOMAIN || "http://localhost:2405";
const ENABLE_NGINX = process.env.ENABLE_NGINX === "true";

console.log("TEMPLATE_DIR:", TEMPLATE_DIR);
console.log("LINKS_ROOT:", LINKS_ROOT);



exports.trackView = async (req, res) => {
  console.log("🔥 TRACK VIEW API CALLED");
  console.log("BODY:", req.body);

  try {
    const { companySlug, divisionSlug, usernameSlug, projectSlug } = req.body;

    if (!companySlug || !divisionSlug || !usernameSlug || !projectSlug) {
      return res.status(400).json({
        message: "Presentation identifiers are required",
      });
    }

    const presentation = await Presentation.findOneAndUpdate(
      {
        companySlug,
        divisionSlug,
        usernameSlug,
        projectSlug,
      },
      {
        $set: {
          lastSeenAt: new Date(),
        },
        $inc: {
          viewCount: 1,
        },
      },
      {
        new: true,
      },
    );

    if (!presentation) {
      return res.status(404).json({
        message: "Presentation not found",
      });
    }

    return res.json({
      success: true,
      lastSeenAt: presentation.lastSeenAt,
      viewCount: presentation.viewCount,
    });
  } catch (error) {
    console.error("Failed to track presentation view:", error);

    return res.status(500).json({
  success: false,
  message: "Failed to generate presentation URL.",
});
  }
};

exports.checkUrlExists = (req, res) => {
  try {
    const { userName, companyName, divisionName, projectName } = req.query;

    if (!userName || !companyName || !divisionName || !projectName) {
      return res.status(400).json({
        exists: false,
        message: "All fields are required",
      });
    }

    const usernameSlug = slugify(userName);
    const companySlug = slugify(companyName);
    const divisionSlug = slugify(divisionName);
    const projectSlug = slugify(projectName);

    const targetDir = path.join(
      LINKS_ROOT,
      companySlug,
      divisionSlug,
      usernameSlug,
      projectSlug,
    );

    const htmlPath = path.join(targetDir, "index.html");

    const exists = fs.existsSync(htmlPath);

    const url = `/ppt/${companySlug}/${divisionSlug}/${usernameSlug}/${projectSlug}/`;

    return res.json({
      exists,
      url: exists ? url : null,
    });
  } catch (error) {
    console.error("URL existence check failed:", error);

    return res.status(500).json({
      exists: false,
      message: "Failed to check presentation link",
    });
  }
};

exports.generateUrl = async (req, res) => {
  try {
    const {
      userName,
      companyName,
      section,
      slides,
      divisionName,
      projectName,
      active,
      expiration,
      customExpiration,

    } = req.body;

    const isActive = active === "true" || active === true;
    const expiresAt = computeExpiresAt(expiration, customExpiration);

    if (
      !userName ||
      !companyName ||
      !divisionName ||
      !projectName ||
      !section
    ) {
      return res.status(400).json({
  success: false,
  message:
    "User name, company name, division name, project name and section are required.",
});
    }

    const selectedSections = Array.isArray(section) ? section : [section];

    console.log("Selected sections:", selectedSections);
    console.log("Selected slides:", slides);

    const usernameSlug = slugify(userName);
    const companySlug = slugify(companyName);
    const divisionSlug = slugify(divisionName);
    const projectSlug = slugify(projectName);

    const url = `/ppt/${companySlug}/${divisionSlug}/${usernameSlug}/${projectSlug}/`;
    const targetDir = path.join(
      LINKS_ROOT,
      companySlug,
      divisionSlug,
      usernameSlug,
      projectSlug,
    );

    console.log("User:", userName);
    console.log("Company:", companyName);
    console.log("Section:", section);

    // ---------------------------------------------------------
    // PRESENTATION STORAGE
    // ---------------------------------------------------------
    // New presentations contain ONLY index.html.
    // All CSS/JS/images/videos are served from /ppt-updated/.
    //
    // Existing presentations that already contain global.js are
    // legacy self-contained copies and are intentionally untouched.
    // ---------------------------------------------------------
    const htmlPath = path.join(targetDir, "index.html");
    const legacyPresentation =
      fs.existsSync(htmlPath) &&
      fs.existsSync(path.join(targetDir, "global.js"));

    if (legacyPresentation) {
      console.log(
        "Existing legacy presentation detected; keeping its assets.",
      );
    } else {
      fs.mkdirSync(targetDir, { recursive: true });

      // Refresh only the tiny index.html. Shared CSS/JS/media are never copied.
      fs.copyFileSync(
        path.join(TEMPLATE_DIR, "index.html"),
        htmlPath,
      );

      console.log(
        fs.existsSync(htmlPath)
          ? "Created/refreshed lightweight shared-asset presentation:"
          : "Created lightweight shared-asset presentation:",
        targetDir,
      );
    }

    // Bake only this presentation's configuration into index.html.
    updateHtml(
      selectedSections,
      slides,
      targetDir,
      companySlug,
      divisionSlug,
      usernameSlug,
      projectSlug,
      !legacyPresentation,
    );

    updateJs(selectedSections, targetDir);

    const existingPresentation = await Presentation.findOne({
      companySlug,
      divisionSlug,
      usernameSlug,
      projectSlug,
    });

    if (existingPresentation) {
      // Existing presentation → update configuration only
      existingPresentation.projectName = projectName;
      existingPresentation.companyName = companyName;
      existingPresentation.divisionName = divisionName;
      existingPresentation.userName = userName;

      existingPresentation.url = url;
      existingPresentation.sections = selectedSections;
      existingPresentation.slides = slides || {};
      existingPresentation.active = isActive;
      existingPresentation.expiresAt = expiresAt;
      existingPresentation.expirationType = expiration || "never";

      await existingPresentation.save();

      console.log("Existing presentation updated");
    } else {
      // New presentation
      await Presentation.create({
        projectName,
        companyName,
        divisionName,
        userName,

        companySlug,
        divisionSlug,
        usernameSlug,
        projectSlug,

        url,

        sections: selectedSections,
        slides: slides || {},
        active: isActive,
        expiresAt,

        lastSeenAt: null,
        viewCount: 0,
      });

      console.log("New presentation created");
    }

    // ---------------------------------------------------------
    // PUBLIC LINK ACTIVATION
    // ---------------------------------------------------------
    // Local development uses Express:
    //   app.use("/ppt", express.static(pptLinkDir))
    //
    // Production can enable Nginx by setting:
    //   ENABLE_NGINX=true
    // ---------------------------------------------------------
    let confPath = null;

    if (ENABLE_NGINX) {
      confPath = writeLocationBlock({
        usernameSlug,
        companySlug,
        divisionSlug,
        projectSlug,
        targetDir,
      });

      try {
        await reloadNginx();
      } catch (nginxError) {
        console.error(
          "Nginx reload failed:",
          nginxError
        );

        return res.status(500).json({
          success: false,
          message:
            "Presentation created, but failed to activate the URL.",
          url,
        });
      }
    }

    console.log(
      `Generated ${url} -> ${targetDir} (nginx: ${ENABLE_NGINX ? confPath : "disabled"})`
    );

    return res.status(201).json({
  success: true,
  message: "Presentation URL generated successfully.",
  url,
});


  } catch (error) {
    console.error("URL generation failed:", error);
return res.status(500).json({
  success: false,
  message: "Failed to generate presentation URL.",
});
  }
};

// Kept only for local/manual use — in production nginx serves the file
// directly via `alias`, so this never actually runs on real traffic.
exports.showPage = (req, res) => {
  const { username, companyName, divisionName, projectName } = req.params;

  const htmlPath = path.join(
    LINKS_ROOT,
    companyName,
    divisionName,
    username,
    projectName,
    "index.html",
  );
  return res.sendFile(htmlPath);
};
