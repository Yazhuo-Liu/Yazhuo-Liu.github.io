(function () {
  "use strict";

  const dataElement = document.getElementById("song-data");
  const player = document.getElementById("player-section");
  const title = document.getElementById("current-title");
  const audio = document.getElementById("audio");
  const lyricsBox = document.getElementById("lyrics-box");
  const storyBox = document.getElementById("story-section");
  const cards = [...document.querySelectorAll("[data-song-index]")];
  if (!dataElement || !player || !audio || !lyricsBox || !storyBox) return;

  const songs = JSON.parse(dataElement.textContent || "[]");
  let timedLyrics = [];
  let activeLine = -1;
  let currentSong = -1;

  function assetUrl(value) {
    if (!value || /^https?:\/\//i.test(value) || value.startsWith("/")) return value || "";
    return `/${value}`;
  }

  function parseLrc(text) {
    const result = [];
    const pattern = /^\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]\s*(.*)$/;
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(pattern);
      if (!match) continue;
      const milliseconds = Number((match[3] || "0").padEnd(3, "0").slice(0, 3));
      result.push({
        time: Number(match[1]) * 60 + Number(match[2]) + milliseconds / 1000,
        text: match[4].trim()
      });
    }
    return result.sort((a, b) => a.time - b.time);
  }

  function showLyrics(song, rawLyrics) {
    lyricsBox.replaceChildren();
    timedLyrics = song.lyrics?.toLowerCase().endsWith(".lrc") ? parseLrc(rawLyrics) : [];

    if (timedLyrics.length > 0) {
      for (const line of timedLyrics) {
        const element = document.createElement("div");
        element.className = "lrc-line";
        element.textContent = line.text;
        lyricsBox.appendChild(element);
      }
      return;
    }

    lyricsBox.textContent = rawLyrics.trim() || "No lyrics available.";
  }

  function showStory(index) {
    const template = document.getElementById(`song-story-${index}`);
    storyBox.replaceChildren();
    if (!template || !template.content.textContent.trim()) {
      storyBox.hidden = true;
      return;
    }
    storyBox.appendChild(template.content.cloneNode(true));
    storyBox.hidden = false;
  }

  async function playSong(index, autoplay = true) {
    const songIndex = Number(index);
    const song = songs[songIndex];
    if (!song) return;

    currentSong = songIndex;
    activeLine = -1;
    cards.forEach((card) => card.classList.toggle("active", Number(card.dataset.songIndex) === songIndex));
    title.textContent = song.title;
    player.classList.add("visible");
    audio.src = assetUrl(song.audio);
    lyricsBox.textContent = "Loading lyrics…";
    showStory(songIndex);

    try {
      const response = await fetch(assetUrl(song.lyrics));
      showLyrics(song, response.ok ? await response.text() : "");
    } catch {
      showLyrics(song, "");
    }

    history.replaceState(null, "", `#${songIndex}`);
    audio.load();
    if (autoplay) audio.play().catch(() => {});
  }

  function updateActiveLyric() {
    if (timedLyrics.length === 0) return;
    let index = -1;
    for (let i = timedLyrics.length - 1; i >= 0; i -= 1) {
      if (audio.currentTime >= timedLyrics[i].time) {
        index = i;
        break;
      }
    }
    if (index === activeLine) return;
    activeLine = index;
    const lines = [...lyricsBox.querySelectorAll(".lrc-line")];
    lines.forEach((line, lineIndex) => line.classList.toggle("active", lineIndex === index));
    lines[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  cards.forEach((card) => card.addEventListener("click", () => playSong(card.dataset.songIndex)));
  audio.addEventListener("timeupdate", updateActiveLyric);
  audio.addEventListener("ended", () => {
    if (songs.length > 0 && currentSong >= 0) playSong((currentSong + 1) % songs.length);
  });

  const initialIndex = Number(window.location.hash.replace(/^#/, ""));
  if (Number.isInteger(initialIndex) && initialIndex >= 0 && initialIndex < songs.length) {
    playSong(initialIndex, false);
  }
})();
