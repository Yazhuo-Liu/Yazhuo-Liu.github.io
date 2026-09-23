const fs = require("node:fs");
const path = require("node:path");
const MarkdownIt = require("markdown-it");
const { default: Image } = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  const markdown = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: false
  });

  for (const directory of ["css", "docs", "img", "js", "music", "pdf"]) {
    eleventyConfig.addPassthroughCopy(`assets/${directory}`);
  }
  for (const vendorAsset of [
    "aos/aos.css",
    "aos/aos.js",
    "bootstrap/css/bootstrap.min.css",
    "bootstrap/js/bootstrap.bundle.min.js",
    "bootstrap-icons/bootstrap-icons.css",
    "bootstrap-icons/fonts",
    "boxicons/css/boxicons.min.css",
    "boxicons/fonts",
    "glightbox/css/glightbox.min.css",
    "glightbox/js/glightbox.min.js",
    "isotope-layout/isotope.pkgd.min.js",
    "purecounter/purecounter_vanilla.js",
    "swiper/swiper-bundle.min.css",
    "swiper/swiper-bundle.min.js",
    "typed.js/typed.min.js",
    "waypoints/noframework.waypoints.js"
  ]) {
    eleventyConfig.addPassthroughCopy(`assets/vendor/${vendorAsset}`);
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

  eleventyConfig.addShortcode("galleryThumbnail", async (src, alt) => Image(src, {
    widths: [399],
    formats: ["webp"],
    outputDir: "./_site/assets/img/generated/",
    urlPath: "/assets/img/generated/",
    fixOrientation: true,
    sharpWebpOptions: { quality: 76 },
    returnType: "html",
    htmlOptions: {
      imgAttributes: {
        alt,
        class: "img-fluid",
        decoding: "async"
      }
    }
  }));

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
