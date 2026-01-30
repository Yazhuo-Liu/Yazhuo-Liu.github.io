# Music & Lyrics

Place your own songs here and add their entries in `assets/htmls/music.html` to show them on your personal site.

## Where to Put Files

- **Audio**: Put MP3, OGG, etc. in this folder (e.g. `song1.mp3`).
- **Lyrics**:
  - **Plain text**: `.txt` file, one line per phrase; the full text is shown while playing.
  - **LRC with timestamps**: `.lrc` file in the form `[mm:ss.xx] lyrics`; the current line is highlighted as the song plays.
- **Story (optional)**: A `.md` file with the **same base name** as the audio (e.g. `song1.md` for `song1.mp3`) is shown above the player as “歌词背后的故事”. You can write the story behind the lyrics in Markdown.

## Adding a Song in music.html

Open `assets/htmls/music.html` and add an entry to the `SONGS` array at the bottom, for example:

```javascript
{
  title: "Song title",
  audio: "assets/music/your-song.mp3",
  lyrics: "assets/music/your-song.lrc",   // or .txt; use "" if no lyrics
  description: "Optional one-line description"
}
```

Save and refresh the music page to see the new song and play it with lyrics.
