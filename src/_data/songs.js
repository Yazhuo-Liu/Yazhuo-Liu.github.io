const fs = require("node:fs");

module.exports = require("../../assets/music/SongsList.json")
  .slice()
  .reverse()
  .map((song) => {
    const storyPath = song.audio.replace(/\.[^.]+$/, ".md");
    return {
      ...song,
      storyPath,
      storyContent: fs.existsSync(storyPath) ? fs.readFileSync(storyPath, "utf8") : ""
    };
  });
