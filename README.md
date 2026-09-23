# Yazhuo Liu's personal website

This repository builds [yazhuoliu.com](https://yazhuoliu.com) with Eleventy. Personal information and content live in structured data or Markdown files; Eleventy turns them into a plain static site in `_site/`.

## Local development

```bash
npm install
npm run start
```

Useful commands:

- `npm run build` — create the production site in `_site/`.
- `npm run validate` — check source data and referenced files.
- `npm run validate:build` — check generated routes, local links, canonical URLs, IDs, and JSON-LD.
- `npm run check` — run all validations and the production build.

## Content map

| Content | Source of truth |
| --- | --- |
| Identity, contact details, navigation, social profiles | `src/_data/site.json` |
| Education, experience, publications, patents, awards | `src/_data/resume.json` |
| Gallery categories and photographs | `src/_data/gallery.json` |
| Writing cards and article metadata | `src/_data/writings.json` |
| Article bodies | `assets/docs/*.md` |
| Novel chapter order and bodies | `assets/docs/novel/chapters.json` and `assets/docs/novel/*.md` |
| Course metadata and resources | `assets/pdf/Teaching/CoursesList.json` |
| Songs, audio, lyrics, and stories | `assets/music/SongsList.json` and matching media files |

The data loaders in `src/_data/*.js` read those sources during the build. Page templates are in `src/`, while shared layouts and partials are in `src/_includes/`.

## Generated routes

- Homepage: `/`
- Articles: `/articles/` and `/articles/<slug>/`
- Novel: `/novel/` and `/novel/chapter-XX/`
- Music: `/music/`
- Teaching: `/teaching/` and `/teaching/<course-id>/`
- Documents: `/documents/<slug>/`

The former query-string pages under `/assets/htmls/` are generated as `noindex` compatibility redirects, so saved old links continue to work. The original root HTML files remain only as a temporary branch-deployment fallback; Eleventy does not copy them into `_site/`.

## Adding content

For an article, add a Markdown file under `assets/docs/`, then add its title, summary, source, type, and slug to `src/_data/writings.json`. For a novel chapter, add the Markdown file and append it to `assets/docs/novel/chapters.json`. For a course or song, update its JSON source listed above and add the referenced files.

Run `npm run check` before committing. The validators report missing files, duplicate slugs or IDs, broken generated links, malformed structured data, and omitted managed routes.

## Deployment

`.github/workflows/deploy-pages.yml` validates, builds, and uploads `_site/` on every push to `main`. In the repository's GitHub Pages settings, select **GitHub Actions** as the source. `CNAME` and `.nojekyll` are copied into the deployment artifact automatically.
