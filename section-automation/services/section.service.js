const {
  readFile,
  writeFile,
  extractBlock,
  toggleBlock,
} = require("../utils/file.utils");

function updateSections(filePath, sections, selectedSection, cStart, cEnd) {
  let content = readFile(filePath);

  for (const key in sections) {
    const { start, end } = sections[key];
    const block = extractBlock(content, start, end);
    if (block === null) {
      console.warn(`⚠️ "${key}" markers not found in ${filePath} — skip.`);
      continue;
    }

    const newBlock = toggleBlock(block, key === selectedSection, cStart, cEnd);
    if (newBlock !== block) {
      content = content.replace(start + block + end, start + newBlock + end);
    }
  }

  writeFile(filePath, content);
}

module.exports = { updateSections };
