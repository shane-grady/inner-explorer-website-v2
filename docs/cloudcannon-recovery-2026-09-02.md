# CloudCannon sync recovery — 2026-09-02

## Incident

CloudCannon's working copy of `main` contained unpublished editor commits while
GitHub `main` advanced through developer pull requests. The histories diverged and
CloudCannon blocked six pushes and thirteen pulls. Saving was disabled.

No held work was discarded. The CloudCannon preservation action created
`cloudcannon/recovery-2026-09-02` at
`051a86a44e2c2c092ef21e4fcd2b1e6f4951da8f`. The recovery history contained twelve
commit-path touches across eleven unique files; there was no unidentified twelfth
unique file.

## Reconciliation

The recovery was performed from a clean worktree based on then-current GitHub `main`
(`4808222…`), leaving the pre-existing local checkout untouched. Conflict resolution
preserved:

- PR #95's canonical MTSS hero implementation and assets;
- PR #91's La Joya case-study content after field-by-field comparison; and
- PR #96's `<HelpVideo>` blocks in both `signing-in.mdx` and
  `district-setup.mdx`.

Four intended editor copy changes were recovered in the Help articles for daily
habit, district setup, first practice, and rostering/SSO. Recovery PR #97 merged as
`1d0cc062a42f2c1fd0b963e44f7babac4df7daf9` after verification. CloudCannon then
fast-forwarded to that commit and returned to successful Pull, Push, and Backup
operations with no held changes.

Keep the preservation branch until the reliability rollout and final cross-system
readback are complete. Delete only that temporary branch afterward.

## Prevention

Routine CloudCannon Saves remain direct commits to `main`. Developer work stays
pull-request based. Before a developer branch touches CMS-owned content, confirm the
CloudCannon Syncs screen is clean and that editors have saved and left the affected
files. Short Save cycles reduce, but cannot eliminate, same-file Git conflicts.

The reliability work following this recovery standardizes one acceptance command,
`pnpm verify:cms`, across local development, GitHub, CloudCannon, and both Netlify
sites. See [cms-publishing-workflow.md](cms-publishing-workflow.md) for the operating
contract.
