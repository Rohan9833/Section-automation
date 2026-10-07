const mongoose = require("mongoose");

const videoLinkSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companySlug: {
      type: String,
      required: true,
      trim: true,
    },

    divisionName: {
      type: String,
      required: true,
      trim: true,
    },

    divisionSlug: {
      type: String,
      required: true,
      trim: true,
    },

    individualName: {
      type: String,
      required: true,
      trim: true,
    },

    individualSlug: {
      type: String,
      required: true,
      trim: true,
    },

    projectName: {
      type: String,
      required: true,
      trim: true,
    },

    projectSlug: {
      type: String,
      required: true,
      trim: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    productSlug: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    active: {
      type: Boolean,
      default: true,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    viewCount: {
      type: Number,
      default: 0,
    },

    lastSeenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Useful for finding a generated URL quickly
videoLinkSchema.index({
  companySlug: 1,
  divisionSlug: 1,
  individualSlug: 1,
  projectSlug: 1,
  productSlug: 1,
});

module.exports = mongoose.model("VideoLink", videoLinkSchema);