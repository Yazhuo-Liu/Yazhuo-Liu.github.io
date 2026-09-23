const writings = require("./writings.json");

module.exports = writings.items.filter((item) => item.type === "document");
