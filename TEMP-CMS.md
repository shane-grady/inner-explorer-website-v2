# TEMP CMS — editable Help Center replica (bandaid, delete when done)

An identical copy of the Help Center where the internal team can click any text and
edit it in place. Edits autosave to shared storage (Netlify Blobs) so everyone sees
the same draft. Nothing here touches the live site until someone asks Claude to sync.

**This entire tool lives on the `temp-cms` git branch.** `main` has zero temp-CMS
code. The branch is `main` + one overlay commit and is never merged — only the copy
edits themselves reach `main`, as normal PRs written by Claude at sync time.

## For the editing team

- **URL:** https://temp-cms--inner-explorer-help.netlify.app
- **Sign-in (shared):** username `ie-edit` · password: ask Shane (deliberately not
  written in this repo; Claude also keeps it in its local memory on Shane's machine,
  and only its SHA-256 hash lives in `temp-cms-auth.ts`)
- Click any text to edit it. Click away (or press Enter) to save — "Saved ✓" appears
  in the bottom bar. Edited text is highlighted amber.
- **To change where a link points**, hover over the link and click the small
  "Edit link" button that appears above it, enter the new destination, and Save.
  (Home-page article cards are excluded — their destination follows the article.)
- **Review edits** (bottom-right button) lists every saved edit across the site, with
  per-edit Revert.
- Grayed-out expectations: sidebar nav labels, "Previous/Next" titles, reading times,
  and section eyebrows are _derived_ text and not editable — edit the article title or
  the source they come from instead. If some text won't take a click, note the change
  in your sync request and Claude will apply it manually.
- This is a copy. It is password-protected, hidden from search engines, and sends no
  analytics. Nothing you do here changes help.innerexplorer.com.

## Sync to live (a prompt to Claude)

Say something like: **"Apply the help center copy edits from the temp CMS."**

Claude then:

1. Fetches all edits (credentials from Claude's local memory or from Shane):
   `curl -s -u 'ie-edit:<password>' 'https://temp-cms--inner-explorer-help.netlify.app/api/edits?export=1'`
2. On a fresh branch off `main`, applies each edit by locating `originalText` in the
   source and substituting the new copy:
   - Article body/title → `src/content/help/*.mdx` (article slug = the page path;
     text may live in MDX component props: `Steps` items, `Callout` bodies, tables).
   - Article title edits also update frontmatter `title` (drives nav, cards,
     prev/next). Home-card blurb edits → frontmatter `blurb`.
   - Help home hero/intro/section copy → `src-help/pages/index.astro`; section
     heading labels → `helpGroups` in `src/lib/help.ts`.
   - Inline formatting maps back to markdown (`<strong>` → `**…**`, links kept).
   - Link edits: records with `kind: "link"` carry `originalHref` → `newHref` (the
     text fields hold the link's label for locating it); map them to the matching
     `href` prop (`ActionLinks`/`LinkCards` items) or markdown link target. Block
     records can also carry href changes inside their `newHtml`.
   - Any edit whose `originalText` no longer matches `main` (content drifted) gets
     flagged in the PR description instead of guessed at.
3. Runs `pnpm check` and `pnpm build:help`, opens a PR to `main` with a per-article
   summary, and shares it for review.
4. **After the PR merges:** wipe the draft store and refresh the replica (below).

## Refresh the replica after a sync

```bash
curl -s -u 'ie-edit:<password>' -X POST 'https://temp-cms--inner-explorer-help.netlify.app/api/edits?wipe=1'
git fetch origin main temp-cms
git branch -f temp-cms-old origin/temp-cms   # safety pointer, delete later
git checkout -B temp-cms origin/main
git cherry-pick <overlay-commit-sha>          # the single "temp CMS overlay" commit
git push -f origin temp-cms
```

The overlay commit is the only commit on `temp-cms` that isn't on `main`
(`git log origin/main..origin/temp-cms`).

## Teardown (removes every trace)

1. Wipe the store: the `wipe=1` curl above.
2. Delete the branch: `git push origin --delete temp-cms` (and any local copies).
3. Netlify → `inner-explorer-help` site → Build & deploy → Branches and deploy
   contexts: remove `temp-cms` from the branch-deploy list.

Done. `main` never carried any of this; the deploy URL stops resolving.

## How it works (for whoever maintains this)

| Piece                                                       | File (this branch only)                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Click-to-edit overlay + review drawer                       | `src-help/components/TempCmsOverlay.astro` (rendered by `HelpSiteLayout.astro`) |
| Edits API on Netlify Blobs (`temp-cms-edits` store)         | `sites/help/netlify/functions/edits.mts`                                        |
| Site-wide Basic-Auth gate (SHA-256 of `user:pass` baked in) | `sites/help/netlify/edge-functions/temp-cms-auth.ts`                            |
| Branch-only dependency                                      | `@netlify/blobs` in `package.json`                                              |
| Amplitude analytics + session replay removed                | `src/layouts/BaseLayout.astro` (branch edit — main ships Amplitude ungated)     |

Blocks are keyed `tag:index` within the content column (`.help-main`); content is
frozen on this branch, so keys are stable. Each stored edit carries both the original
and new text/HTML, so the sync never depends on the keys alone.

To rotate the password: pick a new one, update it here, and replace `EXPECTED_HASH`
in `temp-cms-auth.ts` with `sha256("ie-edit:<new password>")`
(`node -e "console.log(require('crypto').createHash('sha256').update('ie-edit:NEW').digest('hex'))"`),
then push.
