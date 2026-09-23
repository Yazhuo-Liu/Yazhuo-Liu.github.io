(function () {
  "use strict";

  const chapterSelector = document.querySelector("[data-chapter-selector]");
  if (chapterSelector) {
    chapterSelector.addEventListener("change", function () {
      if (this.value) window.location.assign(this.value);
    });
  }
})();
