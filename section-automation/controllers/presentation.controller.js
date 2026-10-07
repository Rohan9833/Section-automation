const { updateHtml } = require("../services/html.service");
const { updateJs } = require("../services/js.service");
const Presentation = require("../models/presentation");


// =========================================================
// GET PRESENTATIONS
// GET /api/presentations
// =========================================================

exports.getPresentation = async (req, res) => {
  try {
    const presentations = await Presentation.find()
      .sort({ createdAt: -1 })
      .lean();

    const data = presentations.map((presentation) => ({
      ...presentation,
      viewUrl: `${process.env.VIEW_URL}${presentation.url}`,
    }));

    const totalLinks = data.length;

    const viewedLinks = data.filter(
      (presentation) => presentation.lastSeenAt
    ).length;

    const neverViewedLinks = data.filter(
      (presentation) => !presentation.lastSeenAt
    ).length;

    return res.json({
      success: true,
      presentations: data,
      totalLinks,
      viewedLinks,
      neverViewedLinks,
      userName: "DigiLateral",
    });

  } catch (error) {
    console.error(
      "Failed to load presentations:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load presentations",
    });
  }
};


// =========================================================
// TRACK PRESENTATION VIEW
// POST /api/presentations/track-view
// =========================================================

exports.trackView = async (req, res) => {
  console.log("🔥 TRACK VIEW API CALLED");
  console.log("BODY:", req.body);

  try {
    const {
      companySlug,
      divisionSlug,
      usernameSlug,
      projectSlug,
    } = req.body;

    if (
      !companySlug ||
      !divisionSlug ||
      !usernameSlug ||
      !projectSlug
    ) {
      return res.status(400).json({
        success: false,
        message: "Presentation identifiers are required",
      });
    }

    const presentation =
      await Presentation.findOneAndUpdate(
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
        }
      );

    if (!presentation) {
      return res.status(404).json({
        success: false,
        message: "Presentation not found",
      });
    }

    return res.json({
      success: true,
      lastSeenAt: presentation.lastSeenAt,
      viewCount: presentation.viewCount,
    });

  } catch (error) {
    console.error(
      "Failed to track presentation view:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to track presentation view",
    });
  }
};


// =========================================================
// UPDATE MASTER PRESENTATION
// POST /api/presentations/update
// =========================================================

exports.updatePresentation = (req, res) => {
  const { section } = req.body;

  if (!section) {
    return res.status(400).json({
      success: false,
      message: "Section is required",
    });
  }

  try {
    updateHtml(section);

    console.log(
      `Section "${section}" activated successfully in HTML`
    );

    const jsUpdated = updateJs(section);

    if (jsUpdated) {
      console.log(
        `Section "${section}" activated successfully in JavaScript`
      );
    }

    return res.json({
      success: true,
      message: "Presentation updated successfully",
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to update presentation",
    });
  }
};


// =========================================================
// CHECK PRESENTATION STATUS
// GET /api/url/status
// =========================================================

exports.checkStatus = async (req, res) => {
  try {
    const {
      companySlug,
      divisionSlug,
      usernameSlug,
      projectSlug,
    } = req.query;

    const presentation =
      await Presentation.findOne({
        companySlug,
        divisionSlug,
        usernameSlug,
        projectSlug,
      });

    if (!presentation) {
      return res.json({
        active: false,
        reason: "not_found",
      });
    }

    const expired =
      presentation.expiresAt &&
      presentation.expiresAt < new Date();

    return res.json({
      active: presentation.active && !expired,
      reason: !presentation.active
        ? "inactive"
        : expired
          ? "expired"
          : null,
    });

  } catch (error) {
    console.error(
      "Status check failed:",
      error
    );

    return res.status(500).json({
      active: true,
    });
  }
};


// =========================================================
// TOGGLE ACTIVE
// POST /api/presentations/:id/toggle
// =========================================================

exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    const presentation =
      await Presentation.findById(id);

    if (!presentation) {
      return res.status(404).json({
        success: false,
        message: "Presentation not found",
      });
    }

    presentation.active =
      !presentation.active;

    await presentation.save();

    return res.json({
      success: true,
      message: "Presentation status updated",
      presentation: {
        id: presentation._id,
        active: presentation.active,
      },
    });

  } catch (error) {
    console.error(
      "Toggle failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to toggle status",
    });
  }
};


// =========================================================
// UPDATE SETTINGS
// PATCH /api/presentations/:id/settings
// =========================================================

exports.updateSettings = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      isActive,
      expirationType,
      expiresAt,
    } = req.body;

    console.log("========== UPDATE SETTINGS ==========");
console.log("REQ BODY:", req.body);
console.log("expirationType:", expirationType);
console.log("expirationType type:", typeof expirationType);
console.log("=====================================");

    const presentation =
      await Presentation.findById(id);

    if (!presentation) {
      return res.status(404).json({
        success: false,
        message: "Presentation not found",
      });
    }

    presentation.active = !!isActive;

    presentation.expirationType =
      expirationType || "never";

    presentation.expiresAt =
      expiresAt
        ? new Date(expiresAt)
        : null;

    await presentation.save();

    return res.json({
      success: true,
      presentation: {
        id: presentation._id,
        active: presentation.active,
        expirationType:
          presentation.expirationType,
        expiresAt:
          presentation.expiresAt,
      },
    });

  } catch (error) {
    console.error(
      "Failed to update presentation settings:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update settings",
    });
  }
};