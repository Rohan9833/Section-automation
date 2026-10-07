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

  content = content.replace("__PRESENTATION_CONFIG__", configString);

  fs.writeFileSync(htmlPath, content, "utf8");

  console.log("✅ Presentation configuration written to index.html");

  console.log(presentationConfig);
}

module.exports = { updateHtml };
