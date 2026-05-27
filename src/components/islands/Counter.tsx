import { useState } from 'react';

/**
 * Minimal React island — used on /styleguide to demonstrate client-side hydration
 * (and to keep the React runtime OFF the marketing pages). Reach for an island only
 * when interactivity is genuinely needed; otherwise use a vanilla Astro component.
 */
export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => setCount((c) => c - 1)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted"
        aria-label="Decrease"
      >
        &minus;
      </button>
      <span
        className="min-w-8 text-center text-xl font-semibold text-foreground tabular-nums"
        aria-live="polite"
      >
        {count}
      </span>
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}
