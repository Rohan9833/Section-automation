const fs = require("fs");

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function extractBlock(content, startMarker, endMarker) {
  const startIndex = content.indexOf(startMarker);
  if (startIndex === -1) return null;
  const endIndex = content.indexOf(endMarker, startIndex + startMarker.length);
  if (endIndex === -1) return null;
  return content.substring(startIndex + startMarker.length, endIndex);
}

// Ek hi function HTML (<!-- -->) aur JS (/* */) dono ke liye
function toggleBlock(block, shouldShow, cStart, cEnd) {
  const trimmed = block.trim();
  const isCommented = trimmed.startsWith(cStart) && trimmed.endsWith(cEnd);

  if (shouldShow) {
    if (!isCommented) return block; // already visible hai
    return `\n${trimmed.slice(cStart.length, -cEnd.length).trim()}\n`;
  }
  if (isCommented) return block; // already hidden hai
  return `\n${cStart}\n${trimmed}\n${cEnd}\n`;
}

// Copies the master ppt-updated template into a fresh per-link folder.
function copyDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

module.exports = { readFile, writeFile, extractBlock, toggleBlock, copyDir };