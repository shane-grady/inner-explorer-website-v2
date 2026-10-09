# CloudCannon full verification — 2026-07-14

## Hosted build

- Site: `inner-explorer-website-v2` (`154511`)
- Testing domain: `https://black-kale.cloudvent.net/`
- Final configuration build: `22054526`
- Result: successful on Node 24 / Astro 6 / pnpm 11
- Hosted route audit: 72 of 72 generated HTML routes returned rendered HTML; 0 failures
- Production manifest: 1,129 emitted files and 844 unique asset/media references; 0 missing

## Visual Editor

Every output-producing collection entry was opened directly in CloudCannon's Visual
Editor and inspected after the final build. A passing entry had a rendered `main`, the
shared footer, and none of the following editor states:

- `Failed to render component`
- `Failed to render ... editable region`
- `No preview available`
- `Site not built`

| Collection   | Entries tested | Passed | Failed |
| ------------ | -------------: | -----: | -----: |
| Blog         |              4 |      4 |      0 |
| Case studies |              8 |      8 |      0 |
| Help         |             11 |     11 |      0 |
| Narrators    |             30 |     30 |      0 |
| Series       |              4 |      4 |      0 |
| **Total**    |         **57** | **57** |  **0** |

## Defects found and resolved

1. The registered site header used `Astro.url`, which is unavailable in CloudCannon's
   client-side Astro renderer. It now reads `Astro.request.url`, which CloudCannon shims.
2. One optional styled blog headline was bound to a plain-text editable region. Styled
   HTML remains editable through its configured sidebar HTML input; plain headlines keep
   their inline text region.
3. Figure and HelpFigure snippets requested gallery thumbnails for Astro source assets
   and intentional screenshot placeholders. They now use stable text/icon previews, so
   valid snippets do not show misleading missing-preview cards.

## Reproducible checks

```bash
npx @cloudcannon/cli validate
pnpm check
pnpm build
node scripts/verify-cloudcannon.mjs https://black-kale.cloudvent.net/ --pages-only
```
