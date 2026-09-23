(function () {
  "use strict";

  const links = [...document.querySelectorAll(".teaching-nav-pills a")];
  if (links.length === 0) return;

  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function updateActiveSection() {
    const position = window.scrollY + 150;
    let activeId = sections[0]?.id;
    for (const section of sections) {
      if (section.offsetTop <= position) activeId = section.id;
    }
    links.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
    });
  }

  links.forEach((link) => {
    link.addEventListener("click", function (event) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  window.addEventListener("scroll", updateActiveSection, { passive: true });
  updateActiveSection();
})();
