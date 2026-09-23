const fs = require("node:fs");
const path = require("node:path");
const MarkdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  const markdown = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: false
  });

  for (const directory of ["css", "docs", "img", "js", "music", "pdf", "vendor"]) {
    eleventyConfig.addPassthroughCopy(`assets/${directory}`);
  }
  eleventyConfig.addPassthroughCopy({ "src/.nojekyll": ".nojekyll" });

  eleventyConfig.addFilter("readableDate", (value) => {
    if (!value) return "";
    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(date);
  });

  eleventyConfig.addFilter("fileExists", (value) => {
    if (!value || /^https?:\/\//.test(value)) return true;
    return fs.existsSync(path.resolve(value));
  });

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("markdown", (value) => markdown.render(value || ""));
  eleventyConfig.addFilter("songManifest", (songs) => JSON.stringify(
    songs.map(({ title, audio, lyrics, description }) => ({ title, audio, lyrics, description }))
  ).replace(/</g, "\\u003c"));

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
