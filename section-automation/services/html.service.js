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

  /*
   * New generated presentations contain only index.html.
   * Their CSS, JS, images, thumbnails, slides and videos are served
   * from the shared /ppt-updated/ directory.
   *
   * The <base> tag is critical here because all original PPT assets
   * use relative paths such as "global.css", "slide1/..." and
   * "global.js".
   */
  if (useSharedAssets) {
    const sharedBaseTag = '<base href="/ppt-updated/" />';

    if (!/<base\s+href=["']\/ppt-updated\//i.test(content)) {
      content = content.replace(
        /<head>/i,
        `<head>\n    ${sharedBaseTag}`,
      );
    }
  }

  content = content.replace(
    "__PRESENTATION_CONFIG__",
    configString,
  );

  fs.writeFileSync(htmlPath, content, "utf8");

  console.log("✅ Presentation configuration written to index.html");
  console.log(presentationConfig);
}

module.exports = { updateHtml };
