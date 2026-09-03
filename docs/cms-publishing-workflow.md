# CloudCannon publishing and ownership

CloudCannon is connected directly to `main`. A routine editor Save creates a descriptive Git commit on `main`; it does not require a Project, publishing branch, or pull request. Developer changes continue to use reviewed pull requests.

## Ownership

Marketing owns normal content and media changes exposed by CloudCannon:

- `src/content/pages/**`
- `src/content/blog/**`
- `src/content/case-studies/**`
- `src/content/help/**`
- `src/content/narrators/**`
- `src/content/series/**`
- `src/content/testimonials/**`
- `src/data/navigation.json`
- `src/data/footer.json`
- `src/data/help-ui.json`
- media selected through configured CloudCannon pickers

Developers own layout and behavior:

- components and route templates
- Astro and Zod schemas
- CloudCannon configuration and editable-region wiring
- build, validation, CI, redirect, and deployment configuration
- design tokens and styling

The thirteen Marketing Page files are a fixed-layout public contract. Marketing can edit their content, metadata, media, and supported repeatable lists. Adding, removing, or reordering page sections is a code change.

## Developer coordination

Before starting or merging a pull request that touches a marketing-owned file:

1. Confirm the CloudCannon **Syncs** screen has no pending pushes, pulls, or errors.
2. Confirm active editors have saved their work and are not editing the same file.
3. Refresh the branch from the latest `main` before resolving or merging content changes.

If the work is substantial, agree on a short editing pause for the affected files. Do not make marketers manage branches for routine work, and do not add a branch rule that blocks CloudCannon's direct commits to `main`.

## Repository history

The Save prompt asks only **What changed and why?**. CloudCannon combines that answer with its automatic file summary, author, and date. This is the repository-side record of what the editor changed; preserve it when investigating or reverting a save.

## Provisioned build settings

Keep the hosted services aligned with the committed files. Initial Site settings only
apply when a CloudCannon Site is created; they do not update an existing Site.

- CloudCannon: install `pnpm install --frozen-lockfile`, build `pnpm verify:cms`,
  output `dist`, and use the repository `.nvmrc` for Node.
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
- CloudCannon Save -> descriptive commit on `main` -> repository verification -> V2 Netlify staging and `help.innerexplorer.com`.
- `innerexplorer.com` remains on the legacy website and outside this publishing flow.
