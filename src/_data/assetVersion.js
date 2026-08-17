// Erzeugt beim Build für jede Asset-Datei einen kurzen Inhalts-Hash. Wird als
// Cache-Busting-Query-Parameter an style.css/main.js angehängt (z.B. ?v=ab12cd34),
// damit Browser und Cloudflare-CDN nach einem Deploy garantiert die neue Version
// laden statt tagelang eine veraltete Fassung aus dem Cache zu servieren
// (Cache-Control: max-age=14400 auf statischen Assets).
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function hashFile(relativePath) {
  const filePath = path.join(__dirname, "..", relativePath);
  const content = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(content).digest("hex").slice(0, 8);
}

module.exports = {
  css: hashFile("assets/css/style.css"),
  js: hashFile("assets/js/main.js"),
};
