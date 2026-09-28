// Assembles the static pages: src/pages/*.html + src/partials/*.html -> project root.
// Run: node build.js
const fs = require("fs");
const path = require("path");

const root = __dirname;
const partials = {};
for (const f of fs.readdirSync(path.join(root, "src/partials"))) {
  partials[path.basename(f, ".html")] = fs.readFileSync(path.join(root, "src/partials", f), "utf8").trim();
}

for (const f of fs.readdirSync(path.join(root, "src/pages"))) {
  let html = fs.readFileSync(path.join(root, "src/pages", f), "utf8");
  html = html.replace(/<!--\s*@(\w+)\s*-->/g, (m, name) => {
    if (!(name in partials)) throw new Error(`Unknown partial @${name} in ${f}`);
    return partials[name];
  });
  // Mark the current page in the main nav.
  html = html.replace(new RegExp(`(<nav class="nav"[\\s\\S]*?)<a href="${f}">`), `$1<a href="${f}" aria-current="page">`);
  fs.writeFileSync(path.join(root, f), html);
  console.log("built", f);
}
