require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const connectDb = require("./config/db.js");

const { requireLogin } = require("./middleware/auth.middleware.js");

const presentationRoutes = require("./routes/presentation.routes");
const urlRoutes = require("./routes/url.routes");
const authRoutes = require("./routes/auth.routes");
const fileRoutes = require("./routes/file.routes.js");
const fileController = require("./controllers/file.controller.js");
const videoRoutes = require("./routes/video.routes.js");
const videosDir = path.join(__dirname, "../products/Videos");
console.log("VIDEOS DIR:", videosDir);
console.log(
  "VIDEOS DIR EXISTS:",
  fs.existsSync(videosDir)
);
const app = express();

connectDb();


// =========================================================
// PATHS
// =========================================================

const pptDir = path.join(
  __dirname,
  "../ppt-updated"
);

const pptLinkDir = path.join(
  __dirname,
  "../ppt-links"
);


// =========================================================
// MIDDLEWARE
// =========================================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://digi-ppt.digilateral.com",
  "https://digilateral.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // such as Postman/server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },
    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  "/Videos",
  express.static(videosDir)
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);


// =========================================================
// STATIC FILES
// =========================================================

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});




// Master PPT
app.use(
  "/ppt-updated",
  express.static(pptDir)
);

// PUBLIC ZIP LINK
app.get(
  "/zip/:companySlug/:divisionSlug/:individualSlug/:projectSlug",
  fileController.downloadFiles
);

// Generated PPTs
app.use(
  "/ppt",
  express.static(pptLinkDir)
);

// Thumbnail files
app.use(
  "/thumbnail",
  express.static(
    path.join(__dirname, "thumbnail")
  )
);


// =========================================================
// AUTH API
// =========================================================

// =========================================================
// HOME / SERVER STATUS
// =========================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running 🚀",
    port: 2405,
    timestamp: new Date().toISOString(),
  });
});

app.use(
  "/api/auth",
  authRoutes
);


// =========================================================
// VIDEO API
// =========================================================

// =========================================================
// VIDEO API
// =========================================================

app.post("/test-video", (req, res) => {
  console.log("🔥 DIRECT TEST ROUTE HIT");
  console.log("BODY:", req.body);

  res.json({
    success: true,
    message: "Direct route works",
    body: req.body,
  });
});

app.use(
  "/api/video-products",
  videoRoutes
);

app.use(
  "/api",
  videoRoutes
);


// =========================================================
// PRESENTATION API
// =========================================================

app.use(
  "/api/presentations",
  presentationRoutes
);


// =========================================================
// URL API
// =========================================================

app.use(
  "/api/url",
  urlRoutes
);


// =========================================================
// ZIP API
// =========================================================

app.use(
  "/api/zip",
  fileRoutes
);


// =========================================================
// SERVER
// =========================================================

app.listen(2405, "0.0.0.0", () => {
  console.log(
    "Server Running on port 2405"
  );
});