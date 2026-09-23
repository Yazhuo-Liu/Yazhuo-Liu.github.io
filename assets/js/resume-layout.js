(function () {
  "use strict";

  const container = document.querySelector(".resume-masonry");
  if (!container) return;

  const blocks = Array.from(container.querySelectorAll(":scope > .resume-block"));
  const presentations = Array.from(container.querySelectorAll(".resume-presentation"));
  const desktopLayout = window.matchMedia("(min-width: 993px)");
  let animationFrame = null;

  function resetLayout() {
    container.classList.remove("is-measuring", "is-grouped");
    container.replaceChildren(...blocks);
  }

  function stackHeight(items, rowGap) {
    return items.reduce((total, item) => total + item.height, 0) +
      Math.max(0, items.length - 1) * rowGap;
  }

  function findMostBalancedColumns(items, rowGap) {
    if (items.length < 2) return [items, []];

    const combinationCount = 2 ** items.length;
    let bestColumns = null;
    let smallestDifference = Number.POSITIVE_INFINITY;
    let smallestMaximum = Number.POSITIVE_INFINITY;

    for (let mask = 1; mask < combinationCount - 1; mask += 1) {
      // Mirrored partitions are identical, so keep the first section on the
      // left and evaluate every possible m+n split only once.
      if ((mask & 1) === 0) continue;

      const columns = [[], []];
      items.forEach((item, index) => {
        columns[(mask & (2 ** index)) !== 0 ? 0 : 1].push(item);
      });

      const heights = columns.map((column) => stackHeight(column, rowGap));
      const difference = Math.abs(heights[0] - heights[1]);
      const maximum = Math.max(...heights);

      if (
        difference < smallestDifference ||
        (difference === smallestDifference && maximum < smallestMaximum)
      ) {
        bestColumns = columns;
        smallestDifference = difference;
        smallestMaximum = maximum;
      }
    }

    return bestColumns || [items, []];
  }

  function buildColumns(columns) {
    return columns.map((column) => {
      const columnElement = document.createElement("div");
      columnElement.className = "resume-column";
      column.forEach((item) => columnElement.append(item.block));
      return columnElement;
    });
  }

  function balanceLayout() {
    resetLayout();
    if (!desktopLayout.matches) return;

    container.classList.add("is-measuring");

    const containerStyles = window.getComputedStyle(container);
    const rowGap = Number.parseFloat(containerStyles.rowGap) || 24;
    const measuredBlocks = blocks.map((block) => ({
      block,
      height: block.getBoundingClientRect().height
    }));
    const columns = findMostBalancedColumns(measuredBlocks, rowGap);

    container.replaceChildren(...buildColumns(columns));
    container.classList.remove("is-measuring");
    container.classList.add("is-grouped");
  }

  function scheduleLayout() {
    if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    animationFrame = window.requestAnimationFrame(() => {
      animationFrame = null;
      balanceLayout();
    });
  }

  scheduleLayout();
  presentations.forEach((presentation) => presentation.addEventListener("toggle", scheduleLayout));
  window.addEventListener("load", scheduleLayout, { once: true });
  window.addEventListener("resize", scheduleLayout, { passive: true });
  desktopLayout.addEventListener("change", scheduleLayout);

  if (document.fonts?.ready) {
    document.fonts.ready.then(scheduleLayout);
  }
})();
