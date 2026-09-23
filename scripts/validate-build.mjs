import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const output = path.join(root, "_site");
const errors = [];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function outputPathForUrl(rawUrl, pagePath) {
  if (
    !rawUrl ||
    rawUrl.startsWith("#") ||
    rawUrl.startsWith("mailto:") ||
    rawUrl.startsWith("tel:") ||
    rawUrl.startsWith("javascript:") ||
    rawUrl.startsWith("data:") ||
    rawUrl.startsWith("blob:") ||
    /^https?:\/\//i.test(rawUrl) ||
    rawUrl.startsWith("//")
  ) {
    return null;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(rawUrl.split(/[?#]/, 1)[0]);
  } catch {
    errors.push(`${pagePath}: malformed URL encoding in ${rawUrl}`);
    return null;
  }

  if (!pathname) return null;
  const relativePath = pathname.startsWith("/")
    ? pathname.slice(1)
    : path.normalize(path.join(path.dirname(pagePath), pathname));

  if (relativePath.endsWith("/")) return path.join(relativePath, "index.html");
  if (!path.extname(relativePath)) return path.join(relativePath, "index.html");
  return relativePath;
}

const expectedPages = [
  "index.html",
  "articles/index.html",
  "articles/cahn-hilliard-fft/index.html",
  "articles/install-lammps-python/index.html",
  "articles/install-abaqus-ubuntu/index.html",
  "articles/install-abaqus-fortran-windows/index.html",
  "articles/install-gmsh-neper/index.html",
  "novel/index.html",
  "novel/chapter-01/index.html",
  "novel/chapter-05/index.html",
  "music/index.html",
  "teaching/index.html",
  "teaching/coe3001/index.html",
  "documents/crystal-plasticity-framework/index.html",
  "assets/htmls/article.html",
  "assets/htmls/music.html",
  "assets/htmls/novel.html",
  "assets/htmls/pdf_viewer.html",
  "assets/htmls/teaching.html"
];

for (const relativePath of expectedPages) {
  if (!fs.existsSync(path.join(output, relativePath))) {
    errors.push(`missing generated page: ${relativePath}`);
  }
}

const htmlFiles = walk(output)
  .filter((filePath) => filePath.endsWith(".html"))
  .filter((filePath) => !filePath.includes(`${path.sep}assets${path.sep}vendor${path.sep}`));
const canonicalUrls = new Map();
let jsonLdCount = 0;

for (const filePath of htmlFiles) {
  const pagePath = path.relative(output, filePath);
  const html = fs.readFileSync(filePath, "utf8");
  const isLegacyRedirect = pagePath.startsWith(`assets${path.sep}htmls${path.sep}`);

  for (const match of html.matchAll(/\s(?:href|src)=["']([^"']+)["']/g)) {
    const outputPath = outputPathForUrl(match[1], pagePath);
    if (outputPath && !fs.existsSync(path.join(output, outputPath))) {
      errors.push(`${pagePath}: references missing output file ${match[1]}`);
    }
  }

  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length > 0) {
    errors.push(`${pagePath}: duplicate ids ${duplicateIds.join(", ")}`);
  }

  for (const [index, match] of [...html.matchAll(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/g)].entries()) {
    jsonLdCount += 1;
    try {
      JSON.parse(match[1]);
    } catch (error) {
      errors.push(`${pagePath}: JSON-LD block ${index + 1} is invalid (${error.message})`);
    }
  }

  if (isLegacyRedirect) {
    if (!/<meta name=["']robots["'] content=["']noindex/.test(html)) {
      errors.push(`${pagePath}: legacy redirect is missing noindex`);
    }
  } else {
    const canonical = html.match(/<link rel=["']canonical["'] href=["']([^"']+)["']/)?.[1];
    if (!canonical) {
      errors.push(`${pagePath}: canonical URL is missing`);
    } else if (canonicalUrls.has(canonical)) {
      errors.push(`${pagePath}: canonical URL duplicates ${canonicalUrls.get(canonical)} (${canonical})`);
    } else {
      canonicalUrls.set(canonical, pagePath);
    }
  }
}

const indexHtml = fs.readFileSync(path.join(output, "index.html"), "utf8");
const sitemapXml = fs.readFileSync(path.join(output, "sitemap.xml"), "utf8");
const robotsPath = path.join(output, "robots.txt");
const cnamePath = path.join(output, "CNAME");
const robotsTxt = fs.existsSync(robotsPath) ? fs.readFileSync(robotsPath, "utf8") : "";
const cname = fs.existsSync(cnamePath) ? fs.readFileSync(cnamePath, "utf8").trim() : "";
const siteOrigin = indexHtml.match(/<link rel=["']canonical["'] href=["'](https?:\/\/[^/]+)/)?.[1];
const sitemapUrls = new Set([...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));

if (indexHtml.includes("assets/htmls/")) {
  errors.push("index.html still links to a legacy assets/htmls page");
}
if (/fetch\(["']assets\/music\/SongsList\.json["']\)/.test(indexHtml)) {
  errors.push("index.html still loads the homepage song list at runtime");
}
for (const obsoletePattern of ["assets/htmls/", "?src=", "?course=", "COE2001"]) {
  if (sitemapXml.includes(obsoletePattern)) {
    errors.push(`sitemap.xml contains an obsolete or draft route: ${obsoletePattern}`);
  }
}
for (const canonical of canonicalUrls.keys()) {
  if (!sitemapUrls.has(canonical)) errors.push(`sitemap.xml is missing canonical URL: ${canonical}`);
}
if (siteOrigin) {
  const expectedHost = new URL(siteOrigin).host;
  if (cname !== expectedHost) errors.push(`CNAME is ${cname || "empty"}; expected ${expectedHost}`);
  if (!robotsTxt.includes(`Sitemap: ${siteOrigin}/sitemap.xml`)) {
    errors.push("robots.txt does not reference the canonical sitemap URL");
  }
}
if (!fs.existsSync(cnamePath)) errors.push("CNAME was not generated");
if (!fs.existsSync(robotsPath)) errors.push("robots.txt was not generated");
if (!fs.existsSync(path.join(output, ".nojekyll"))) errors.push(".nojekyll was not copied to the generated site");

if (errors.length > 0) {
  console.error(`Generated-site validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Generated-site validation passed: ${htmlFiles.length} managed pages, ` +
  `${canonicalUrls.size} unique canonical URLs, ${jsonLdCount} valid JSON-LD block(s).`
);
