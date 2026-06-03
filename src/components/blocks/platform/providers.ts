// Single-sign-on partner marks. These are third-party brand logos — their colors
// belong to the vendor, not our design system, so they intentionally live here as
// raw SVG data (a .ts module, not design styling) rather than as tokens. Clean
// recreations used as integration-partner marks; swap for official assets before
// publishing (see tasks/todo.md). Rendered via `set:html` in SignOn.astro.

export interface Provider {
  name: string;
  svg: string;
}

export const PROVIDERS: Provider[] = [
  {
    name: 'Clever',
    svg: '<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="9" fill="#436CF6"/><path d="M27 15a8 8 0 1 0 0 10" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/></svg>',
  },
  {
    name: 'Schoology',
    svg: '<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="9" fill="#0E72B5"/><path d="M24.4 15.2c-1-1-2.4-1.6-4.2-1.6-2.6 0-4.4 1.3-4.4 3.3 0 1.9 1.5 2.7 3.9 3.2 2.6.5 3.2.9 3.2 1.7s-.9 1.3-2.3 1.3c-1.7 0-3-.7-4-1.8" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    name: 'ClassLink',
    svg: '<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="9" fill="#17A0DC"/><g fill="#fff"><rect x="11" y="11" width="7.2" height="7.2" rx="2"/><rect x="21.8" y="11" width="7.2" height="7.2" rx="2"/><rect x="11" y="21.8" width="7.2" height="7.2" rx="2"/><rect x="21.8" y="21.8" width="7.2" height="7.2" rx="2"/></g></svg>',
  },
  {
    name: 'Google Classroom',
    svg: '<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="9" fill="#1E8E3E"/><rect x="9" y="13" width="22" height="14" rx="1.5" fill="#fff"/><circle cx="20" cy="19" r="2.7" fill="#1E8E3E"/><path d="M14.6 25.4c0-3 2.4-4.6 5.4-4.6s5.4 1.6 5.4 4.6Z" fill="#1E8E3E"/></svg>',
  },
  {
    name: 'Canvas',
    svg: '<svg viewBox="0 0 40 40"><g fill="#E72A26"><circle cx="31" cy="20" r="2.7"/><circle cx="27.8" cy="27.8" r="2.7"/><circle cx="20" cy="31" r="2.7"/><circle cx="12.2" cy="27.8" r="2.7"/><circle cx="9" cy="20" r="2.7"/><circle cx="12.2" cy="12.2" r="2.7"/><circle cx="20" cy="9" r="2.7"/><circle cx="27.8" cy="12.2" r="2.7"/></g></svg>',
  },
  {
    name: 'Gmail',
    svg: '<svg viewBox="0 0 48 48"><path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"/><path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"/><polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"/><path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8C4.924,8,3,9.924,3,12.298z"/><path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8C43.076,8,45,9.924,45,12.298z"/></svg>',
  },
];
