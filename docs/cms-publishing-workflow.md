# CloudCannon publishing and ownership

CloudCannon edits the Help Center (help.innerexplorer.com) only. It is connected directly to `main`. A routine editor Save creates a descriptive Git commit on `main`; it does not require a Project, publishing branch, or pull request. Developer changes continue to use reviewed pull requests.

The marketing site (www.innerexplorer.com) is being rebuilt from the new design and is not edited in CloudCannon. Its copy lives at the top of each page file; see `CLAUDE.md`.

## Ownership

Marketing owns the Help Center content and media exposed by CloudCannon:

- `src/content/help/**` (the articles, including the privacy policy, which
  www.innerexplorer.com/privacy-policy/ also renders)
- `src/data/help-ui.json` (Help Center chrome and page copy)
- media selected through configured CloudCannon pickers (`src-help/assets/images/`,
  `public/videos/help/`)

Developers own layout and behavior:

- components and route templates (the Help Center's are frozen in `src-help/`; see
  `src-help/README.md`)
- Astro and Zod schemas
- CloudCannon configuration and editable-region wiring
- build, validation, CI, redirect, and deployment configuration
- design tokens and styling

## Developer coordination

Before starting or merging a pull request that touches a marketing-owned file:

1. Confirm the CloudCannon **Syncs** screen has no pending pushes, pulls, or errors.
2. Confirm active editors have saved their work and are not editing the same file.
3. Refresh the branch from the latest `main` before resolving or merging content changes.

If the work is substantial, agree on a short editing pause for the affected files. Do not make marketers manage branches for routine work, and do not add a branch rule that blocks CloudCannon's direct commits to `main`.

## Repository history

The Save prompt asks only **What changed and why?**. CloudCannon combines that answer
with the author and date. The Git commit diff is the exact file-level record of what
the editor changed; preserve the summary and diff when investigating or reverting a
save. Do not add CloudCannon's `[changes]` placeholder to the template: as of this
rollout it renders deleted files as `Updated null`, which makes deletion commits less
clear rather than more informative.

## Provisioned build settings

Keep the hosted services aligned with the committed files. Initial Site settings only
apply when a CloudCannon Site is created; they do not update an existing Site.

- CloudCannon: install `pnpm install --frozen-lockfile`, build `pnpm verify:help`,
  output `dist-help`, and use the repository `.nvmrc` for Node.
- Marketing Netlify site: repository-root Base and configuration, with no Package
  directory.
- Help Netlify site: leave Base unset (repository root) and set Package directory to
  `sites/help`. This makes Netlify install from the root while selecting
  `sites/help/netlify.toml` for Help-only deploy settings.

CloudCannon, GitHub verification, Marketing Netlify, and Help Netlify are separate
statuses. A green result in one is not proof that the others deployed; record the
commit SHA and read back each destination before announcing a release.

## Failures and recovery

Netlify must retain the last successful deployment when a new commit fails verification.

For a CMS commit that fails verification:

1. Record the exact failing commit SHA, changed files, build link, and author summary.
2. Revert that exact commit on `main`; do not mix unrelated fixes into the rollback.
3. Let CloudCannon pull the revert and return to a clean sync state.
4. Repair the original change in a developer pull request or coordinate a clean new CMS save.

For a sync divergence or held CloudCannon work, never use **Discard changes**. Preserve the CloudCannon changes on a dedicated recovery branch, reconcile them against current `main` in a reviewed developer pull request, and keep the recovery branch until GitHub, CloudCannon, and both deployments have passed readback.

## Release flow

- Developer pull request -> GitHub `main` -> CloudCannon pull and rebuild -> updated editor layout/configuration.
- CloudCannon Save -> descriptive commit on `main` -> repository verification -> `help.innerexplorer.com` (and a V2 Netlify staging rebuild, since a privacy-policy edit also changes /privacy-policy/).
- `innerexplorer.com` remains on the legacy website and outside this publishing flow.
