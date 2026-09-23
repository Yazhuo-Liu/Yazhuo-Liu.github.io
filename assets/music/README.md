# Music & Lyrics

Place your own songs here and add their entries in **`assets/music/SongsList.json`** to show them on your personal site.

## Where to Put Files

- **Audio**: Put MP3, OGG, etc. in this folder (e.g. `song1.mp3`).
- **Lyrics**:
  - **Plain text**: `.txt` file, one line per phrase; the full text is shown while playing.
  - **LRC with timestamps**: `.lrc` file in the form `[mm:ss.xx] lyrics`; the current line is highlighted as the song plays.
- **Story**: A `.md` file with the **same base name** as the audio (for example, `song1.md` for `song1.mp3`) is rendered into the page at build time as “歌词背后的故事”.

## Adding a Song

Edit **`assets/music/SongsList.json`** and add an object to the array, for example:

```json
{
  "title": "Song title",
  "audio": "assets/music/your-song.mp3",
  "lyrics": "assets/music/your-song.lrc",
  "description": "Optional one-line description"
}
```

- `title`, `audio`, `lyrics`, and the matching story file are validated during the build.
- Run `npm run check` from the repository root. The new song appears at `/music/` after the site is rebuilt.
