const fs = require("node:fs");
const path = require("node:path");
const chapterConfig = require("../../assets/docs/novel/chapters.json");

function titleFromMarkdown(content, fallback) {
  const match = content.match(/^#+\s*(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function slugFromPath(chapterPath, index) {
  if (/A_index\.md$/i.test(chapterPath)) return "index";
  const number = path.basename(chapterPath).match(/\d+/)?.[0];
  return number ? `chapter-${number.padStart(2, "0")}` : `chapter-${String(index).padStart(2, "0")}`;
}

const chapters = chapterConfig.map((entry, index) => {
  const chapterPath = typeof entry === "string" ? entry : entry.path;
  const content = fs.readFileSync(chapterPath, "utf8");
  return {
    path: chapterPath,
    slug: slugFromPath(chapterPath, index),
    title: typeof entry === "object" && entry.title
      ? entry.title
      : titleFromMarkdown(content, path.basename(chapterPath, ".md")),
    content
  };
});

const chapterList = chapters
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
