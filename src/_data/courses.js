const data = require("../../assets/pdf/Teaching/CoursesList.json");

module.exports = data.courses
  .filter((course) => !course.draft)
  .map((course) => ({ ...course, slug: course.id.toLowerCase() }));
