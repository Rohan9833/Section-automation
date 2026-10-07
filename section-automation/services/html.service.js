const path = require("path");
const fs = require("fs");

function updateHtml(
  selectedSections,
  selectedSlides,
  baseDir,
  companySlug,
  divisionSlug,
  usernameSlug,
  projectSlug,
  useSharedAssets = true,
) {
  const htmlPath = path.join(baseDir, "index.html");

  let content = fs.readFileSync(htmlPath, "utf8");

  const presentationConfig = {
    sections: selectedSections || [],
    slides: selectedSlides || {},
    companySlug,
    divisionSlug,
    usernameSlug,
    projectSlug,
  };

  const configString = JSON.stringify(presentationConfig);

  // Generated presentations use the shared master assets instead of copying them.  // Existing legacy presentations are left untouched by the controller.  if (!content.includes('<base href="/ppt-updated/"')) {    content = content.replace(      /<head>/i,      '<head>\\n    <base href="/ppt-updated/" />'    );  }  content = content.replace("__PRESENTATION_CONFIG__", configString);

  fs.writeFileSync(htmlPath, content, "utf8");

  console.log("✅ Presentation configuration written to index.html");

  console.log(presentationConfig);
}

module.exports = { updateHtml };
