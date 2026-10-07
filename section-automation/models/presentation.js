const mongoose = require("mongoose");

const presentationSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true,
        trim: true,
    },

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


    userName: {
        type: String,
        required: true,
        trim: true,
    },



    companySlug: {
        type: String,
        required: true,
    },

    divisionSlug: {
        type: String,
        required: true,
    },

    usernameSlug: {
        type: String,
        required: true,
    },

    projectSlug: {
        type: String,
        required: true,
    },

    url: {
        type: String,
        required: true,
    },

    sections: {
        type: [String],
        default: [],
    },

    slides: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    
    active: {
        type: Boolean,
        default: true,
    },

    expirationType: {
  type: String,
  enum: ["never", "1d", "7d", "30d", "90d", "custom"],
  default: "never",
},

    createdAt: {
        type: Date,
        default: Date.now,
    },

    expiresAt: {
    type: Date,
    default: null,
},

    lastSeenAt: {
        type: Date,
        default: null,
    },

    viewCount: {
        type: Number,
        default: 0,
    }
},

{
    timestamps: true,
});


presentationSchema.index({
    companySlug: 1,
    divisionSlug: 1,
    usernameSlug: 1,
    projectSlug: 1,
}, {
    unique: true,
})


module.exports = mongoose.model(
    "Presentation",
    presentationSchema
)