const fs = require("fs");
const path = require("path");
const crypto = require("crypto");



const FileShare = require("../models/fileShare");
const slugify = require("../utils/slugify");

// =========================================================
// FILE STORAGE
// =========================================================

const FILE_ROOT =
  process.env.FILE_UPLOAD_DIR ||
  path.join(__dirname, "../../file-uploads");

fs.mkdirSync(FILE_ROOT, { recursive: true });

// =========================================================
// HELPERS
// =========================================================

function sanitizeFileName(fileName) {
  return (
    path
      .basename(fileName || "")
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .trim() || "file"
  );
}

function sanitizeZipName(fileName) {
  let name = String(fileName || "").trim();

  // Remove .zip if frontend already sent it
  name = name.replace(/\.zip$/i, "");

  name = name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");

  return name.trim() || "download";
}

function sanitizeRelativePath(relativePath) {
  if (!relativePath) {
    return "";
  }

  let normalized = relativePath.replace(/\\/g, "/");

  normalized = normalized
    .split("/")
    .filter(
      (part) =>
        part &&
        part !== "." &&
        part !== ".."
    )
    .map((part) =>
      part.replace(
        /[<>:"|?*\x00-\x1F]/g,
        "_"
      )
    )
    .join("/");

  return normalized;
}

function generateStoredName(originalName) {
  const extension = path.extname(originalName);

  return (
    crypto.randomBytes(16).toString("hex") +
    extension
  );
}

// =========================================================
// UPLOAD FILES
// POST /api/zip/upload
// =========================================================

exports.uploadFiles = async (req, res) => {
  let uploadedPermanentFiles = [];
  let shareDirectory = null;

  try {
    const {
      companyName,
      divisionName,
      individualName,
      projectName,
      zipFileName,
      active,
      expiration,
      customExpiration,
    } = req.body;

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (
      !companyName ||
      !divisionName ||
      !individualName ||
      !projectName ||
      !zipFileName
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company name, division name, individual name, project name and ZIP file name are required.",
      });
    }

    if (
      !req.files ||
      req.files.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select at least one file.",
      });
    }

    // -----------------------------------------------------
    // SLUGS
    // -----------------------------------------------------

    const companySlug =
      slugify(companyName);

    const divisionSlug =
      slugify(divisionName);

    const individualSlug =
      slugify(individualName);

    const projectSlug =
      slugify(projectName);

    if (
      !companySlug ||
      !divisionSlug ||
      !individualSlug ||
      !projectSlug
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid company, division, individual or project name.",
      });
    }

    // -----------------------------------------------------
    // PUBLIC URL
    // -----------------------------------------------------

    const publicDomain =
      (process.env.PUBLIC_DOMAIN || "").replace(/\/$/, "");

    const url =
      `${publicDomain}/zip/` +
      `${companySlug}/` +
      `${divisionSlug}/` +
      `${individualSlug}/` +
      `${projectSlug}`;

    // -----------------------------------------------------
    // CHECK DUPLICATE
    // -----------------------------------------------------

    const existing =
      await FileShare.findOne({
        companySlug,
        divisionSlug,
        individualSlug,
        projectSlug,
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "A ZIP link already exists for this company, division, individual and project.",
      });
    }

    // -----------------------------------------------------
    // CREATE STORAGE DIRECTORY
    // -----------------------------------------------------

    const shareId =
      crypto.randomBytes(16).toString("hex");

    shareDirectory = path.join(
      FILE_ROOT,
      shareId
    );

    fs.mkdirSync(
      shareDirectory,
      {
        recursive: true,
      }
    );

    // -----------------------------------------------------
    // RELATIVE PATHS
    // -----------------------------------------------------

    let relativePaths =
      req.body.relativePaths || [];

    if (
      !Array.isArray(relativePaths)
    ) {
      relativePaths = [
        relativePaths,
      ];
    }

    // -----------------------------------------------------
    // PROCESS FILES
    // -----------------------------------------------------

    const files = [];

    let totalSize = 0;

    for (
      let i = 0;
      i < req.files.length;
      i++
    ) {
      const file = req.files[i];

      const originalName =
        sanitizeFileName(
          file.originalname
        );

      const storedName =
        generateStoredName(
          originalName
        );

      const permanentPath =
        path.join(
          shareDirectory,
          storedName
        );

      // Move uploaded file
      fs.renameSync(
        file.path,
        permanentPath
      );

      uploadedPermanentFiles.push(
        permanentPath
      );

      const relativePath =
        sanitizeRelativePath(
          relativePaths[i]
        );

      files.push({
        originalName,

        storedName,

        filePath:
          permanentPath,

        relativePath,

        mimeType:
          file.mimetype ||
          "application/octet-stream",

        size:
          file.size,
      });

      totalSize +=
        file.size || 0;
    }

    // -----------------------------------------------------
    // EXPIRATION
    // -----------------------------------------------------

    let expiresAt = null;

    if (expiration === "1d") {
      expiresAt = new Date();

      expiresAt.setDate(
        expiresAt.getDate() + 1
      );
    }

    else if (expiration === "7d") {
      expiresAt = new Date();

      expiresAt.setDate(
        expiresAt.getDate() + 7
      );
    }

    else if (expiration === "30d") {
      expiresAt = new Date();

      expiresAt.setDate(
        expiresAt.getDate() + 30
      );
    }

    else if (expiration === "90d") {
      expiresAt = new Date();

      expiresAt.setDate(
        expiresAt.getDate() + 90
      );
    }

    else if (
      expiration === "custom"
    ) {
      if (!customExpiration) {
        return res.status(400).json({
          success: false,
          message:
            "Please select a custom expiration date.",
        });
      }

      expiresAt =
        new Date(customExpiration);

      if (
        isNaN(
          expiresAt.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid expiration date.",
        });
      }

      if (
        expiresAt <= new Date()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Expiration date must be in the future.",
        });
      }
    }

    // -----------------------------------------------------
    // ACTIVE
    // -----------------------------------------------------

    const isActive =
      active === true ||
      active === "true";

    // -----------------------------------------------------
    // SAVE MONGODB
    // -----------------------------------------------------

    const fileShare =
      await FileShare.create({
        companyName:
          companyName.trim(),

        divisionName:
          divisionName.trim(),

        individualName:
          individualName.trim(),

        projectName:
          projectName.trim(),

        zipFileName:
          sanitizeZipName(
            zipFileName
          ),

        companySlug,

        divisionSlug,

        individualSlug,

        projectSlug,

        files,

        url,

        totalSize,

        active:
          isActive,

        expirationType:
          expiration || "never",

        expiresAt,

        createdBy:
          req.session?.username ||
          null,

        downloadCount: 0,
      });

    console.log(
      "===================================="
    );

    console.log(
      "ZIP SHARE CREATED"
    );

    console.log(
      "URL:",
      url
    );

    console.log(
      "ZIP:",
      fileShare.zipFileName
    );

    console.log(
      "FILES:",
      files.length
    );

    console.log(
      "SIZE:",
      totalSize
    );

    console.log(
      "EXPIRES:",
      expiresAt
    );

    console.log(
      "ACTIVE:",
      isActive
    );

    console.log(
      "===================================="
    );

    return res.status(201).json({
      success: true,

      message:
        "ZIP link generated successfully.",

      url,

      zipFileName:
        `${fileShare.zipFileName}.zip`,

      fileCount:
        files.length,

      totalSize,

      expiresAt,

      active:
        fileShare.active,

      files:
        files.map((file) => ({
          name:
            file.originalName,

          relativePath:
            file.relativePath,

          size:
            file.size,

          mimeType:
            file.mimeType,
        })),
    });

  } catch (error) {
    console.error(
      "ZIP upload failed:",
      error
    );

    // -----------------------------------------------------
    // CLEANUP
    // -----------------------------------------------------

    for (
      const filePath
      of uploadedPermanentFiles
    ) {
      try {
        if (
          fs.existsSync(filePath)
        ) {
          fs.unlinkSync(
            filePath
          );
        }
      } catch (
      cleanupError
      ) {
        console.error(
          "File cleanup failed:",
          cleanupError
        );
      }
    }

    if (
      shareDirectory &&
      fs.existsSync(
        shareDirectory
      )
    ) {
      try {
        fs.rmSync(
          shareDirectory,
          {
            recursive: true,
            force: true,
          }
        );
      } catch (
      cleanupError
      ) {
        console.error(
          "Directory cleanup failed:",
          cleanupError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate ZIP link.",
    });
  }
};

// =========================================================
// DOWNLOAD ZIP
// GET /zip/company/division/individual/project
// =========================================================

exports.downloadFiles = async (
  req,
  res
) => {
  try {
    console.log(
      "===================================="
    );

    console.log(
      "🔥 ZIP DOWNLOAD REQUEST"
    );

    console.log(
      "PARAMS:",
      req.params
    );

    // -----------------------------------------------------
    // SLUGS
    // -----------------------------------------------------

    const companySlug =
      String(
        req.params.companySlug || ""
      )
        .trim()
        .toLowerCase();

    const divisionSlug =
      String(
        req.params.divisionSlug || ""
      )
        .trim()
        .toLowerCase();

    const individualSlug =
      String(
        req.params.individualSlug || ""
      )
        .trim()
        .toLowerCase();

    const projectSlug =
      String(
        req.params.projectSlug || ""
      )
        .trim()
        .toLowerCase();

    // -----------------------------------------------------
    // VALIDATE PARAMETERS
    // -----------------------------------------------------

    if (
      !companySlug ||
      !divisionSlug ||
      !individualSlug ||
      !projectSlug
    ) {
      return res.status(400).send(
        "Invalid ZIP link."
      );
    }

    // -----------------------------------------------------
    // FIND SHARE
    // -----------------------------------------------------

    const fileShare =
      await FileShare.findOne({
        companySlug,
        divisionSlug,
        individualSlug,
        projectSlug,
      });

    if (!fileShare) {
      console.log(
        "❌ ZIP LINK NOT FOUND"
      );

      return res
        .status(404)
        .send(
          "ZIP link not found."
        );
    }

    console.log(
      "ZIP LINK FOUND:",
      fileShare._id
    );

    // -----------------------------------------------------
    // ACTIVE CHECK
    // -----------------------------------------------------

    if (
      fileShare.active === false
    ) {
      console.log(
        "❌ ZIP LINK INACTIVE"
      );

      return res
        .status(410)
        .send(
          "This ZIP link is inactive."
        );
    }

    // -----------------------------------------------------
    // EXPIRATION CHECK
    // -----------------------------------------------------

    if (
      fileShare.expiresAt &&
      fileShare.expiresAt <=
      new Date()
    ) {
      console.log(
        "❌ ZIP LINK EXPIRED"
      );

      return res
        .status(410)
        .send(
          "This ZIP link has expired."
        );
    }

    // -----------------------------------------------------
    // CHECK FILES
    // -----------------------------------------------------

    if (
      !Array.isArray(
        fileShare.files
      ) ||
      fileShare.files.length === 0
    ) {
      console.log(
        "❌ NO FILES FOUND"
      );

      return res
        .status(404)
        .send(
          "No files available for this ZIP."
        );
    }

    for (
      const file
      of fileShare.files
    ) {
      console.log(
        "Checking file:",
        file.filePath
      );

      if (
        !file.filePath ||
        !fs.existsSync(
          file.filePath
        )
      ) {
        console.error(
          "❌ MISSING FILE:",
          file.filePath
        );

        return res
          .status(404)
          .send(
            "One or more files are no longer available."
          );
      }
    }

    // -----------------------------------------------------
    // ZIP NAME
    // -----------------------------------------------------

    const zipName =
      `${sanitizeZipName(
        fileShare.zipFileName
      )}.zip`;

    // -----------------------------------------------------
    // RESPONSE HEADERS
    // -----------------------------------------------------

    res.status(200);

    res.setHeader(
      "Content-Type",
      "application/zip"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipName}"`
    );

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    res.setHeader(
      "Pragma",
      "no-cache"
    );

    res.setHeader(
      "Expires",
      "0"
    );

    // -----------------------------------------------------
    // LOAD ARCHIVER
    // -----------------------------------------------------


const { ZipArchive } = await import("archiver");

const archive = new ZipArchive({
  zlib: {
    level: 6,
  },
})

    // -----------------------------------------------------
    // ARCHIVE ERROR
    // -----------------------------------------------------

    archive.on(
      "warning",
      (error) => {
        console.warn(
          "⚠️ ZIP WARNING:",
          error
        );
      }
    );

    archive.on(
      "error",
      (error) => {
        console.error(
          "❌ ZIP ERROR:",
          error
        );

        if (
          !res.headersSent
        ) {
          res
            .status(500)
            .send(
              "Failed to create ZIP."
            );
        } else {
          res.destroy(
            error
          );
        }
      }
    );

    // -----------------------------------------------------
    // ZIP FINISHED
    // -----------------------------------------------------

    archive.on(
      "finish",
      async () => {
        console.log(
          "✅ ZIP STREAM FINISHED"
        );

        try {
          await FileShare.updateOne(
            {
              _id:
                fileShare._id,
            },
            {
              $inc: {
                downloadCount: 1,
              },

              $set: {
                lastDownloadedAt:
                  new Date(),
              },
            }
          );

          console.log(
            "✅ DOWNLOAD COUNT UPDATED"
          );
        } catch (
        error
        ) {
          console.error(
            "Download count update failed:",
            error
          );
        }
      }
    );

    // -----------------------------------------------------
    // PIPE ZIP TO RESPONSE
    // -----------------------------------------------------

    archive.pipe(res);

    console.log(
      "📦 ZIP STREAM STARTED"
    );

    // -----------------------------------------------------
    // ADD FILES
    // -----------------------------------------------------

    for (
      const file
      of fileShare.files
    ) {
      const zipEntryName =
        sanitizeRelativePath(
          file.relativePath
        ) ||
        sanitizeFileName(
          file.originalName
        );

      console.log(
        "Adding file:",
        {
          filePath:
            file.filePath,

          zipEntryName,

          exists:
            fs.existsSync(
              file.filePath
            ),
        }
      );

      archive.file(
        file.filePath,
        {
          name:
            zipEntryName,
        }
      );
    }

    // -----------------------------------------------------
    // FINALIZE
    // -----------------------------------------------------

    console.log(
      "📦 FINALIZING ZIP"
    );

    await archive.finalize();

    console.log(
      "✅ ARCHIVE FINALIZE COMPLETED"
    );

  } catch (error) {
    console.error(
      "❌ ZIP DOWNLOAD FAILED:",
      error
    );

    if (
      !res.headersSent
    ) {
      return res
        .status(500)
        .send(
          "Failed to download ZIP."
        );
    }

    res.destroy(
      error
    );
  }
};

// =========================================================
// GET ZIP DASHBOARD
// GET /api/zip/dashboard
// =========================================================

exports.getFileDashboardData =
  async (req, res) => {
    try {
      const fileShares =
        await FileShare.find()
          .sort({
            createdAt: -1,
          })
          .lean();

      const publicDomain =
        (process.env.PUBLIC_DOMAIN || "").replace(/\/$/, "");

      const data =
        fileShares.map(
          (fileShare) => ({
            ...fileShare,

            viewUrl:
              `${publicDomain}` +
              `/zip/${fileShare.companySlug}` +
              `/${fileShare.divisionSlug}` +
              `/${fileShare.individualSlug}` +
              `/${fileShare.projectSlug}`,
          })
        );

      return res.json({
        success: true,
        fileShares: data,
      });

    } catch (error) {
      console.error(
        "Failed to load ZIP file data:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load ZIP file data",
      });
    }
  };

// =========================================================
// CHECK ZIP EXISTS
// GET /api/zip/check
// =========================================================

exports.checkZipExists =
  async (req, res) => {
    try {
      const {
        companyName,
        divisionName,
        individualName,
        projectName,
      } = req.query;

      if (
        !companyName ||
        !divisionName ||
        !individualName ||
        !projectName
      ) {
        return res.status(400).json({
          exists: false,
          message:
            "All fields are required",
        });
      }

      const companySlug =
        slugify(companyName);

      const divisionSlug =
        slugify(divisionName);

      const individualSlug =
        slugify(individualName);

      const projectSlug =
        slugify(projectName);

      const existing =
        await FileShare.findOne({
          companySlug,
          divisionSlug,
          individualSlug,
          projectSlug,
        });

      if (!existing) {
        return res.json({
          exists: false,
          url: null,
        });
      }

      const publicDomain =
        process.env.PUBLIC_DOMAIN ||
        "http://localhost:2405";

      const url =
        `${publicDomain}` +
        `/zip/${companySlug}` +
        `/${divisionSlug}` +
        `/${individualSlug}` +
        `/${projectSlug}`;

      return res.json({
        exists: true,
        url,
      });

    } catch (error) {
      console.error(
        "ZIP existence check failed:",
        error
      );

      return res.status(500).json({
        exists: false,
        message:
          "Failed to check ZIP link",
      });
    }
  };