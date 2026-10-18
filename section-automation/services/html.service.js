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
  slideOrder = null,
) {
  const htmlPath = path.join(baseDir, "index.html");

  let content = fs.readFileSync(htmlPath, "utf8");

  const presentationConfig = {
    sections: selectedSections || [],
    slides: selectedSlides || {},
    slideOrder: Array.isArray(slideOrder) ? slideOrder : [],
    companySlug,
    divisionSlug,
    usernameSlug,
    projectSlug,
  };

  const configString = JSON.stringify(presentationConfig);

  /*
   * New generated presentations contain only index.html.
   * Their CSS, JS, images, thumbnails, slides and videos are served
   * from the shared /ppt-assets/ directory.
   *
   * The <base> tag is critical here because all original PPT assets
   * use relative paths such as "global.css", "slide1/..." and
   * "global.js".
   */
  if (useSharedAssets) {
	const sharedBaseTag = '<base href="/ppt-assets/" />';
	if (!/<base\s+href=["']\/ppt-assets\//i.test(content)) {
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
