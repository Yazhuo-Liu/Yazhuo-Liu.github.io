# Novel

Eleventy automatically scans the Markdown files in this directory and creates `/novel/` plus one clean URL per chapter. No chapter-list JSON file is needed.

## Adding and ordering chapters

- Keep the landing page as `A_index.md` (or `index.md`). It is always placed first and generates `/novel/`.
- Name chapters `chap1.md`, `chap2.md`, and so on. Filenames use natural sorting, so `chap10.md` comes after `chap9.md`.
- Put a `# Chapter title` heading in each chapter. The first Markdown heading supplies the selector label and page title automatically.
- `README.md` is documentation and is excluded from the scan.

For example, adding this file is enough to publish chapter 6 at `/novel/chapter-06/`:

```text
assets/docs/novel/chap6.md
```

### Auto chapter list in index (A_index.md)

In `A_index.md`, put the placeholder `<!-- AUTO_CHAPTER_LIST -->` where you want the chapter links to appear (for example, under a “目录列表” heading). The build replaces it with links to every discovered chapter, so you do not need to maintain the list by hand.

Run `npm run check` from the repository root after adding, renaming, or reordering chapters.
