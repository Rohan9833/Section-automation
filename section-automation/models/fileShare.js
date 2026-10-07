const mongoose = require("mongoose");


// =========================================================
// FILE ITEM
// =========================================================

const fileItemSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
    },

    storedName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    // Folder structure inside the ZIP
    relativePath: {
      type: String,
      default: "",
    },

    mimeType: {
      type: String,
      default: "application/octet-stream",
    },

    size: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);


// =========================================================
// FILE SHARE
// =========================================================

const fileShareSchema = new mongoose.Schema(
  {

    // =====================================================
    // INFORMATION FROM FRONTEND
    // =====================================================

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    divisionName: {
      type: String,
      required: true,
      trim: true,
    },

    individualName: {
      type: String,
      required: true,
      trim: true,
    },

    projectName: {
      type: String,
      required: true,
      trim: true,
    },

    zipFileName: {
      type: String,
      required: true,
      trim: true,
    },

    


    // =====================================================
    // URL SLUGS
    // =====================================================

    companySlug: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
  type: String,
  required: true,
  trim: true,
},

    divisionSlug: {
      type: String,
      required: true,
      trim: true,
    },

    individualSlug: {
      type: String,
      required: true,
      trim: true,
    },

    projectSlug: {
      type: String,
      required: true,
      trim: true,
    },


    // =====================================================
    // LINK STATUS
    // =====================================================

    active: {
      type: Boolean,
      default: true,
    },


    // =====================================================
    // EXPIRATION
    // =====================================================

    expirationType: {
      type: String,

      enum: [
        "never",
        "1d",
        "7d",
        "30d",
        "90d",
        "custom",
      ],

      default: "never",
    },

    expiresAt: {
      type: Date,
      default: null,
    },


    // =====================================================
    // FILES
    // =====================================================

    files: {
      type: [fileItemSchema],

      required: true,

      validate: {
        validator: function (files) {
          return (
            Array.isArray(files) &&
            files.length > 0
          );
        },

        message:
          "At least one file is required.",
      },
    },


    // =====================================================
    // STATISTICS
    // =====================================================

    totalSize: {
      type: Number,
      default: 0,
    },

    downloadCount: {
      type: Number,
      default: 0,
    },

    lastDownloadedAt: {
  type: Date,
  default: null,
},


    // =====================================================
    // CREATOR
    // =====================================================

    createdBy: {
      type: String,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);


// =========================================================
// UNIQUE URL
// =========================================================

fileShareSchema.index(
  {
    companySlug: 1,
    divisionSlug: 1,
    individualSlug: 1,
    projectSlug: 1,
  },
  {
    unique: true,
  }
);


module.exports = mongoose.model(
  "FileShare",
  fileShareSchema
);