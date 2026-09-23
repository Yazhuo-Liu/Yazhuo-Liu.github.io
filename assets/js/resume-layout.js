(function () {
  "use strict";

  const container = document.querySelector(".resume-masonry");
  if (!container) return;

  const blocks = Array.from(container.querySelectorAll(":scope > .resume-block"));
  const desktopLayout = window.matchMedia("(min-width: 993px)");
  let animationFrame = null;

  function resetLayout() {
    container.classList.remove("is-measuring", "is-balanced");
    container.style.height = "";

    blocks.forEach((block) => {
      block.style.left = "";
      block.style.top = "";
      block.style.width = "";
    });
  }

  function findMostBalancedColumns(items, rowGap) {
    if (items.length < 2) return [items, []];

    let bestColumns = null;
    let smallestDifference = Number.POSITIVE_INFINITY;
    let smallestMaximum = Number.POSITIVE_INFINITY;
    const combinationCount = 2 ** items.length;

    // Keep the first section in the first column to avoid evaluating mirrored
    // versions of the same layout. With only a few resume sections, checking
    // every combination is inexpensive and produces the best height balance.
    for (let mask = 1; mask < combinationCount - 1; mask += 1) {
      if ((mask & 1) === 0) continue;

      const columns = [[], []];
      items.forEach((item, index) => {
        columns[(mask & (2 ** index)) !== 0 ? 0 : 1].push(item);
      });

      const heights = columns.map((column) => (
        column.reduce((total, item) => total + item.height, 0) +
        Math.max(0, column.length - 1) * rowGap
      ));
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

  function balanceLayout() {
    resetLayout();
    if (!desktopLayout.matches) return;

    container.classList.add("is-measuring");

    const containerStyles = window.getComputedStyle(container);
    const columnGap = Number.parseFloat(containerStyles.columnGap) || 32;
    const rowGap = Number.parseFloat(containerStyles.rowGap) || 28;
    const columnWidth = (container.clientWidth - columnGap) / 2;
    const measuredBlocks = blocks.map((block, index) => ({
      block,
      index,
      height: block.getBoundingClientRect().height
    }));

    const columns = findMostBalancedColumns(measuredBlocks, rowGap);

    container.classList.remove("is-measuring");
    container.classList.add("is-balanced");

    const renderedHeights = columns.map((column, columnIndex) => {
      let top = 0;
      column.forEach((item) => {
          item.block.style.width = `${columnWidth}px`;
          item.block.style.left = `${columnIndex * (columnWidth + columnGap)}px`;
          item.block.style.top = `${top}px`;
          top += item.height + rowGap;
      });
      return Math.max(0, top - rowGap);
    });

    container.style.height = `${Math.max(...renderedHeights)}px`;
  }

  function scheduleLayout() {
    if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    animationFrame = window.requestAnimationFrame(() => {
      animationFrame = null;
      balanceLayout();
    });
  }

  scheduleLayout();
  window.addEventListener("load", scheduleLayout, { once: true });
  window.addEventListener("resize", scheduleLayout, { passive: true });
  desktopLayout.addEventListener("change", scheduleLayout);

  if (document.fonts?.ready) {
    document.fonts.ready.then(scheduleLayout);
  }
})();
