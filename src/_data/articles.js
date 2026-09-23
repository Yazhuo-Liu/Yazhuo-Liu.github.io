const fs = require("node:fs");
const writings = require("./writings.json");

module.exports = writings.items
  .filter((item) => item.type === "article")
  .map((item) => ({
    ...item,
    content: fs.readFileSync(item.source, "utf8")
  }));
