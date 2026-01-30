# Novel

The chapter list is defined in **`chapters.json`**. The reading page loads the table of contents and order from this file.

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

To add a chapter, append a path to `chapters.json`. As long as the first line of the md file is `# Chapter title`, that title will appear in the dropdown.

### Auto chapter list in index (A_index.md)

In `A_index.md`, put the placeholder `<!-- AUTO_CHAPTER_LIST -->` where you want the chapter links to appear (e.g. under a "目录列表" heading). The reading page will replace it with a markdown list of all chapters from `chapters.json`, so you don’t need to maintain the list by hand.
