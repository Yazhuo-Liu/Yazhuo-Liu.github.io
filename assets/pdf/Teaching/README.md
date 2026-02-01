# Teaching course data

The teaching page (`assets/htmls/teaching.html`) is a **template** that reads course data from this folder and renders one page per course.

## Data file

- **`CoursesList.json`** — list of courses. Each course defines syllabus, lecture slides, videos (YouTube links), homework, and exams (paths and titles). Paths in the JSON are relative to the site root; teaching PDFs live under `assets/pdf/Teaching/`.

## JSON format

```json
{
  "courses": [
    {
      "id": "COE3001",
      "name": "Deformable Bodies",
      "code": "COE 3001",
      "institution": "Georgia Institute of Technology",
      "instructor": "Yazhuo Liu",
      "term": "Aug 2025 – May 2026",
      "syllabus": [
        { "title": "Syllabus Fall 2025 (PDF)", "path": "assets/pdf/Teaching/COE3001/Syllabus_Fall.pdf", "meta": "Fall 2025" },
        { "title": "Syllabus Spring 2026 (PDF)", "path": "assets/pdf/Teaching/COE3001/Syllabus_Spring.pdf", "meta": "Spring 2026" }
      ],
      "slides": [
        { "title": "Week 1 – Introduction & Stress", "path": "assets/pdf/Teaching/COE3001_Week1.pdf", "meta": "PDF" }
      ],
      "homework": [
        { "title": "Homework 1", "path": "assets/pdf/Teaching/COE3001_HW1.pdf", "meta": "Due Week 2" }
      ],
      "videos": [
        { "title": "Lecture 1 – Introduction", "url": "https://www.youtube.com/watch?v=VIDEO_ID", "meta": "Optional: duration or date" }
      ],
      "exams": [
        { "title": "Midterm Exam", "path": "assets/pdf/Teaching/COE3001_Midterm.pdf", "meta": "Mid-semester" }
      ]
    }
  ]
}
```

- **Paths** are relative to the **site root** (e.g. `assets/pdf/Teaching/...`). Put your syllabus, slides, homework, and exam PDFs in this folder and reference them in `CoursesList.json`.
- **syllabus** is an array of `{ "title": "...", "path": "...", "meta": "..." }` so you can list multiple versions (e.g. Fall 2025, Spring 2026). Each item appears as a separate card.
- **videos** is an array of `{ "title": "...", "url": "https://www.youtube.com/watch?v=...", "meta": "optional" }`. Use the full YouTube URL (watch or youtu.be). Clicking opens the video in a new tab.
- **id** is used in the URL: `teaching.html?course=COE3001` shows that course.
- If there is only one course, opening `teaching.html` (no `?course=`) shows it. If there are multiple courses, it shows a list to choose from.

## Adding a new course

1. Open `CoursesList.json` in this folder.
2. Add a new object to the `courses` array with the same fields (id, name, code, institution, instructor, term, syllabus, slides, videos, homework, exams).
3. Put your PDFs under `assets/pdf/Teaching/` (or a subfolder) and set each `path` in the JSON to that path from the site root (e.g. `assets/pdf/Teaching/OtherCourse_Week1.pdf`).
4. Open `teaching.html?course=YOUR_COURSE_ID` or, if it’s the only course, just `teaching.html`.
