import { useLayoutEffect, useRef, type ReactNode } from 'react';

export default function MasonryGrid({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid || typeof ResizeObserver === 'undefined') return;
    const cards = Array.from(grid.children) as HTMLElement[];
    let width = grid.getBoundingClientRect().width;

    const layout = () => {
      const style = getComputedStyle(grid);
      const columns = parseInt(style.getPropertyValue('--catalog-columns'), 10);
      const gap = parseFloat(style.getPropertyValue('--catalog-gap'));
      const nextRow = Array<number>(columns).fill(1);
      // Clear obsolete columns before measuring at a new breakpoint, while
      // retaining row spans so a scrolled catalogue never briefly collapses.
      cards.forEach((card, index) => {
        card.style.gridColumnStart = String(index % columns + 1);
      });
      const heights = cards.map(card => Math.ceil(card.getBoundingClientRect().height));

      // Each next card starts at the lowest available top (leftmost on ties).
      // DOM and Tab order stay unchanged; visual tops never go backwards.
      cards.forEach((card, index) => {
        const column = nextRow.indexOf(Math.min(...nextRow));
        card.style.gridColumnStart = String(column + 1);
        card.style.gridRowStart = String(nextRow[column]);
        card.style.gridRowEnd = `span ${heights[index]}`;
        nextRow[column] += heights[index] + gap;
      });
      grid.dataset.masonry = '';
    };

    layout();
    const observer = new ResizeObserver(entries => {
      const newWidth = grid.getBoundingClientRect().width;
      if (newWidth !== width || entries.some(entry => entry.target !== grid)) {
        width = newWidth;
        layout();
      }
    });
    observer.observe(grid);
    cards.forEach(card => observer.observe(card));
    return () => {
      observer.disconnect();
      delete grid.dataset.masonry;
      cards.forEach(card => {
        card.style.removeProperty('grid-column-start');
        card.style.removeProperty('grid-row-start');
        card.style.removeProperty('grid-row-end');
      });
    };
  }, [children]);

  return <div className="places-grid" ref={ref}>{children}</div>;
}
