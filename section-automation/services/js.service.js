const path = require("path");
const jsSections = require("../config/js-sections");
const { updateSections } = require("./section.service");

// baseDir = the per-link folder (e.g. /var/www/ppt-links/shivam/digi)
function updateJs(selectedSection, baseDir) {
  console.log(
    `✅ global.js is shared. Section "${selectedSection}" will be selected by index.html.`
  );
}

module.exports = { updateJs };


