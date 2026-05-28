// Shared one-shot intersection observer.
// Adds an `in` class to each matched element the first time it enters the
// viewport. Falls back to applying the class immediately if IntersectionObserver
// is missing or the user prefers reduced motion — so content is never gated
// behind a JS class set that won't fire.
//
// Sets `data-js-ready="on"` on <html> at module load so styles can opt IN to
// hide-then-reveal behavior only when JS is available. Pages without JS see
// fully-rendered content (their final state), satisfying SEO/no-JS readers.

if (typeof document !== 'undefined') {
  document.documentElement.dataset.jsReady = 'on';
}

export interface ObserveOptions {
  className?: string;
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
}

export function observe(selector: string, opts: ObserveOptions = {}): void {
  const className = opts.className ?? 'in';
  const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
  if (els.length === 0) return;

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (reduced || typeof IntersectionObserver === 'undefined') {
    els.forEach((el) => el.classList.add(className));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add(className);
          if (opts.once !== false) io.unobserve(e.target);
        }
      }
    },
    { rootMargin: opts.rootMargin ?? '0px 0px -10% 0px', threshold: opts.threshold ?? 0.15 },
  );
  els.forEach((el) => io.observe(el));
}
