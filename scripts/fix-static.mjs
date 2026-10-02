// Makes the static export portable:
// 1. font URLs inside the CSS are rewritten relative to the CSS file;
// 2. the "_next" folder is renamed to "assets" (some static hosts reserve names
//    starting with "_"), and every reference to it is updated.
// Result: /out works from any sub-path on any static host.
import { readdirSync, readFileSync, writeFileSync, renameSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const out = join(process.cwd(), "out");

const cssDir = join(out, "_next", "static", "css");
for (const f of readdirSync(cssDir)) {
  if (!f.endsWith(".css")) continue;
  const p = join(cssDir, f);
  const css = readFileSync(p, "utf8");
  const fixed = css.replace(/url\((?:\.\/)?_next\/static\/media\//g, "url(../media/");
  if (fixed !== css) writeFileSync(p, fixed);
}

if (existsSync(join(out, "_next"))) renameSync(join(out, "_next"), join(out, "assets"));

const textExt = new Set([".html", ".js", ".css", ".txt", ".json"]);
function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (textExt.has(extname(f))) {
      const s = readFileSync(p, "utf8");
      // Literal U+FFFD inside JS strings → escape sequence (same value, ASCII-safe)
      const r = s.replaceAll("_next/", "assets/").replaceAll("�", extname(f) === ".js" ? "\\uFFFD" : "�");
      if (r !== s) writeFileSync(p, r);
    }
  }
}
walk(out);

console.log("Static export ready in /out");
