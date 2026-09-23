# Novel

The chapter list is defined in **`chapters.json`**. Eleventy reads the table of contents and every Markdown chapter at build time, then creates `/novel/` and one clean URL per chapter.

## chapters.json format

- An **array** of chapters in reading order.
- Each item may be:
  - **String**: Path only, e.g. `"assets/docs/novel/chap1.md"`. The title is read automatically from the **first `# Title` line** in the corresponding md file.
  - **Object**: `{ "path": "path/to/file.md", "title": "Display title" }`. If `title` is provided, it is used instead of reading from the md file—useful for index pages or files without a `#` heading.

Example:

```json
[
  { "path": "assets/docs/novel/A_index.md", "title": "目录 / Index" },
  "assets/docs/novel/chap1.md",
  "assets/docs/novel/chap2.md"
]
```

To add a chapter, append a path to `chapters.json`. As long as the first line of the Markdown file is `# Chapter title`, that title will appear in the chapter selector and page metadata after the next build.

### Auto chapter list in index (A_index.md)

In `A_index.md`, put the placeholder `<!-- AUTO_CHAPTER_LIST -->` where you want the chapter links to appear (for example, under a “目录列表” heading). The build replaces it with a Markdown list of all chapters from `chapters.json`, so you do not need to maintain the list by hand.

Run `npm run check` from the repository root after adding or reordering chapters.
