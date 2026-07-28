#!/usr/bin/env node
/**
 * Mirrored-file guard. Fails if a file that MUST exist in two places has drifted.
 *
 * WHY: the two-site build (main + Help Center) forces exactly one duplication.
 * Netlify only discovers edge functions under `<base directory>/netlify/edge-functions`,
 * and the Help Center site's base is `sites/help` — so the noindex edge function has to
 * exist verbatim in both trees. Nothing else enforces that, and the failure is silent
 * and expensive: edit one copy, and the other host quietly stops sending
 * `X-Robots-Tag: noindex` — which is how Google indexed the staging mirror last time.
 *
 * Fix a reported mismatch by copying the canonical file over the mirror, never by
 * editing the mirror on its own.
 */
import { readFileSync } from 'node:fs';

/** [canonical, mirror] pairs that must stay byte-identical. */
const MIRRORS = [
  [
    'netlify/edge-functions/noindex-netlify-host.ts',
    'sites/help/netlify/edge-functions/noindex-netlify-host.ts',
  ],
];

let failed = false;

for (const [canonical, mirror] of MIRRORS) {
  let a, b;
  try {
    a = readFileSync(canonical, 'utf8');
  } catch {
    console.error(`✖ missing canonical file: ${canonical}`);
    failed = true;
    continue;
  }
  try {
    b = readFileSync(mirror, 'utf8');
  } catch {
    console.error(`✖ missing mirror: ${mirror}\n  copy it from ${canonical}`);
    failed = true;
    continue;
  }
  if (a !== b) {
    console.error(
      `✖ mirror out of sync: ${mirror}\n  differs from canonical ${canonical} — copy the canonical over it`,
    );
    failed = true;
  }
}

if (failed) {
  console.error('\nMirrored files must stay identical. See scripts/check-mirrors.mjs for why.');
  process.exit(1);
}

console.log(`✔ ${MIRRORS.length} mirrored file(s) in sync`);
