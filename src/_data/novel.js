const fs = require("node:fs");
const path = require("node:path");

const novelDirectory = path.resolve(__dirname, "../../assets/docs/novel");
const relativeNovelDirectory = "assets/docs/novel";
const naturalOrder = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base"
});

function isIndexFile(filename) {
  return /^(?:a_)?index\.md$/i.test(filename);
}

function compareChapterFiles(left, right) {
  if (isIndexFile(left)) return -1;
  if (isIndexFile(right)) return 1;
  return naturalOrder.compare(left, right);
}

function titleFromMarkdown(content, fallback) {
  const match = content.match(/^#+\s*(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function slugFromPath(chapterPath, index) {
  const filename = path.basename(chapterPath);
  if (isIndexFile(filename)) return "index";

  const number = path.basename(chapterPath).match(/\d+/)?.[0];
  if (number) return `chapter-${number.padStart(2, "0")}`;

  const filenameSlug = path.basename(chapterPath, path.extname(chapterPath))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return filenameSlug || `chapter-${String(index).padStart(2, "0")}`;
}

const chapterFiles = fs.readdirSync(novelDirectory, { withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.md$/i.test(entry.name) && !/^readme\.md$/i.test(entry.name))
  .map((entry) => entry.name)
  .sort(compareChapterFiles);

const chapters = chapterFiles.map((filename, index) => {
  const chapterPath = `${relativeNovelDirectory}/${filename}`;
  const content = fs.readFileSync(path.join(novelDirectory, filename), "utf8");
  return {
    path: chapterPath,
    slug: slugFromPath(chapterPath, index),
    title: isIndexFile(filename)
      ? "目录 / Index"
      : titleFromMarkdown(content, path.basename(chapterPath, ".md")),
    content
  };
});

const duplicateSlug = chapters.find((chapter, index) => (
  chapters.findIndex((candidate) => candidate.slug === chapter.slug) !== index
));

if (duplicateSlug) {
  throw new Error(`Duplicate generated novel slug: ${duplicateSlug.slug}`);
}

const chapterList = chapters
  .filter((chapter) => chapter.slug !== "index")
  .map((chapter) => `* [${chapter.title}](/novel/${chapter.slug === "index" ? "" : `${chapter.slug}/`})`)
  .join("\n");

module.exports = chapters.map((chapter, index) => ({
  ...chapter,
  outputPath: chapter.slug === "index" ? "novel/index.html" : `novel/${chapter.slug}/index.html`,
  url: chapter.slug === "index" ? "/novel/" : `/novel/${chapter.slug}/`,
  content: chapter.content
    .replace("<!-- AUTO_CHAPTER_LIST -->", chapterList)
    .replaceAll('src="../docs/', 'src="/assets/docs/'),
  previous: index > 0 ? {
    ...chapters[index - 1],
    url: chapters[index - 1].slug === "index" ? "/novel/" : `/novel/${chapters[index - 1].slug}/`
  } : null,
  next: index < chapters.length - 1 ? {
    ...chapters[index + 1],
    url: chapters[index + 1].slug === "index" ? "/novel/" : `/novel/${chapters[index + 1].slug}/`
  } : null
}));
