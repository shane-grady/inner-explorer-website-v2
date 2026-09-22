// Shared one-shot intersection observer.
// Adds an `in` class to each matched element the first time it enters the
// viewport. Falls back to applying the class immediately if IntersectionObserver
// is missing or the user prefers reduced motion — so content is never gated
// behind a JS class set that won't fire.
//
// Sets `data-js-ready="on"` on <html> so styles can opt IN to hide-then-reveal
// behavior only when JS is available. Pages without JS see fully-rendered content
// (their final state), satisfying SEO/no-JS readers.
//
// BaseLayout ships <ClientRouter />, and a client-side navigation breaks that setup
// in two ways this module has to undo (see the bottom of the file):
//   1. the swap replaces <html>'s attributes with the incoming document's, dropping
//      `data-js-ready` — so nothing is hidden and nothing animates until a reload;
//   2. component <script> modules do not re-execute, so their observe() calls never
//      run again — and once (1) is fixed, un-armed elements would stay hidden.
// Both are handled by re-applying the flag to the incoming document and re-arming
// every registration after the swap.

export interface ObserveOptions {
  className?: string;
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
}

/** Every selector observe() has been asked to watch, so a swap can re-arm them. */
const registry: Array<[string, ObserveOptions]> = [];
/** Elements already being watched, so re-arming never double-observes one. */
let observed = new WeakSet<Element>();
/** Observers bound to the current document, disconnected before the next swap. */
let live: IntersectionObserver[] = [];

function arm(selector: string, opts: ObserveOptions): void {
  const className = opts.className ?? 'in';
  const els = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !observed.has(el),
  );
  if (els.length === 0) return;

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (reduced || typeof IntersectionObserver === 'undefined') {
    els.forEach((el) => {
      observed.add(el);
      el.classList.add(className);
    });
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
  els.forEach((el) => {
    observed.add(el);
    io.observe(el);
  });
  live.push(io);
}

export function observe(selector: string, opts: ObserveOptions = {}): void {
  registry.push([selector, opts]);
  // Armed here as well as on astro:page-load so a page still reveals if the router
  // is ever absent; the WeakSet keeps the two paths from observing an element twice.
  arm(selector, opts);
}

if (typeof document !== 'undefined') {
  document.documentElement.dataset.jsReady = 'on';

  // Set the flag on the INCOMING document so the hidden state is in place for its
  // first paint. Applying it after the swap would flash the content visible, then
  // hide it, then reveal it.
  document.addEventListener('astro:before-swap', (e) => {
    (e as Event & { newDocument?: Document }).newDocument?.documentElement.setAttribute(
      'data-js-ready',
      'on',
    );
    live.forEach((io) => io.disconnect());
    live = [];
    observed = new WeakSet();
  });

  // The swapped-in DOM is a fresh set of elements whose component scripts will not
  // run again, so re-arm every registration against it.
  document.addEventListener('astro:page-load', () => {
    for (const [selector, opts] of registry) arm(selector, opts);
  });
}
