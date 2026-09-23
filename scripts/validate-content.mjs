import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const errors = [];
const require = createRequire(import.meta.url);

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
  } catch (error) {
    errors.push(`${relativePath}: invalid or unreadable JSON (${error.message})`);
    return null;
  }
}

function requireString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${label}: expected a non-empty string`);
  }
}

function checkLocalFile(value, label) {
  if (!value || /^https?:\/\//i.test(value) || value.startsWith("mailto:")) return;
  const cleanPath = decodeURIComponent(value.replace(/^\//, "").split(/[?#]/, 1)[0]);
  if (!cleanPath || !fs.existsSync(path.join(root, cleanPath))) {
    errors.push(`${label}: referenced file does not exist: ${value}`);
  }
}

const site = readJson("src/_data/site.json");
const resume = readJson("src/_data/resume.json");
const gallery = readJson("src/_data/gallery.json");
const writings = readJson("src/_data/writings.json");
const songs = readJson("assets/music/SongsList.json");
const coursesData = readJson("assets/pdf/Teaching/CoursesList.json");
let chapters = [];

try {
  chapters = require("../src/_data/novel.js");
} catch (error) {
  errors.push(`assets/docs/novel: unable to discover chapters (${error.message})`);
}

if (site) {
  for (const key of ["name", "url", "email", "role", "updatedAt", "analyticsId"]) {
    requireString(site[key], `site.${key}`);
  }
  Object.entries(site.images || {}).forEach(([key, value]) => checkLocalFile(value, `site.images.${key}`));
  checkLocalFile(site.cv, "site.cv");
  (site.affiliations || []).forEach((item, index) => checkLocalFile(item.image, `site.affiliations[${index}].image`));
}

if (resume) {
  requireString(resume.updatedAt, "resume.updatedAt");
  (resume.publications || []).forEach((item, index) => {
    requireString(item.title, `resume.publications[${index}].title`);
    requireString(item.citation, `resume.publications[${index}].citation`);
    checkLocalFile(item.url, `resume.publications[${index}].url`);
  });
  (resume.patents || []).forEach((item, index) => checkLocalFile(item.certificate, `resume.patents[${index}].certificate`));
}

if (gallery) {
  const categoryIds = new Set((gallery.categories || []).map((category) => category.id));
  const galleryImages = new Set();
  (gallery.items || []).forEach((item, index) => {
    if (!categoryIds.has(item.category)) errors.push(`gallery.items[${index}].category: unknown category ${item.category}`);
    if (Object.hasOwn(item, "thumbnail")) {
      errors.push(`gallery.items[${index}].thumbnail: derived thumbnails must not be stored in source data`);
    }
    requireString(item.alt, `gallery.items[${index}].alt`);
    requireString(item.caption, `gallery.items[${index}].caption`);
    checkLocalFile(item.image, `gallery.items[${index}].image`);
    if (galleryImages.has(item.image)) errors.push(`gallery.items[${index}].image: duplicate image ${item.image}`);
    galleryImages.add(item.image);
  });

  const galleryDirectory = path.join(root, "assets/img/photos");
  for (const filename of fs.readdirSync(galleryDirectory)) {
    const relativePath = `assets/img/photos/${filename}`;
    if (/-thumb\.[^.]+$/i.test(filename)) {
      errors.push(`${relativePath}: generated thumbnails must not be committed`);
    } else if (/\.(?:jpe?g|png|webp|avif)$/i.test(filename) && !galleryImages.has(relativePath)) {
      errors.push(`${relativePath}: gallery source image is not referenced by gallery.json`);
    }
  }
}

if (writings) {
  const slugs = new Set();
  [...(writings.teaching || []), ...(writings.items || [])].forEach((item, index) => {
    requireString(item.title, `writings item ${index}.title`);
    if (item.source) checkLocalFile(item.source, `writings item ${index}.source`);
    if (item.slug) {
      if (slugs.has(item.slug)) errors.push(`writings item ${index}.slug: duplicate slug ${item.slug}`);
      slugs.add(item.slug);
    }
  });
}

if (Array.isArray(songs)) {
  songs.forEach((song, index) => {
    requireString(song.title, `songs[${index}].title`);
    checkLocalFile(song.audio, `songs[${index}].audio`);
    checkLocalFile(song.lyrics, `songs[${index}].lyrics`);
    checkLocalFile(song.audio.replace(/\.[^.]+$/, ".md"), `songs[${index}].story`);
  });
}

const publicCourses = coursesData?.courses?.filter((course) => !course.draft) || [];
const courseIds = new Set();
for (const [index, course] of publicCourses.entries()) {
  requireString(course.id, `courses[${index}].id`);
  if (courseIds.has(course.id)) errors.push(`courses[${index}].id: duplicate id ${course.id}`);
  courseIds.add(course.id);
  for (const section of ["syllabus", "slides", "homework", "exams"]) {
    for (const [resourceIndex, resource] of (course[section] || []).entries()) {
      checkLocalFile(resource.path, `course ${course.id}.${section}[${resourceIndex}].path`);
    }
  }
}

if (Array.isArray(chapters)) {
  if (!chapters.some((chapter) => chapter.slug === "index")) {
    errors.push("assets/docs/novel: A_index.md or index.md is required");
  }
  chapters.forEach((chapter, index) => {
    checkLocalFile(chapter.path, `chapters[${index}]`);
    requireString(chapter.title, `chapters[${index}].title`);
  });
}

for (const legacySource of [
  "index.html",
  "sitemap.xml",
  "robots.txt",
  "CNAME",
  "convert_images.py",
  "assets/htmls/article.html",
  "assets/htmls/music.html",
  "assets/htmls/novel.html",
  "assets/htmls/pdf_viewer.html",
  "assets/htmls/teaching.html"
]) {
  if (fs.existsSync(path.join(root, legacySource))) {
    errors.push(`${legacySource}: obsolete hand-maintained deployment source must be removed`);
  }
}

if (errors.length > 0) {
  console.error(`Content validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Content validation passed: ${resume?.publications?.length || 0} publications, ` +
  `${gallery?.items?.length || 0} gallery items, ${songs?.length || 0} songs, ` +
  `${publicCourses.length} public course(s), ${chapters.length} novel page(s).`
);
