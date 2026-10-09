# Inner Explorer website

The marketing site for [Inner Explorer](https://www.innerexplorer.com) (daily
audio-guided mindfulness for K-12 schools) and its Help Center
([help.innerexplorer.com](https://help.innerexplorer.com)). Two Astro builds from one
repository:

| Site        | Config                  | Source      | Output       | Netlify config            |
| ----------- | ----------------------- | ----------- | ------------ | ------------------------- |
| Marketing   | `astro.config.mjs`      | `src/`      | `dist/`      | `netlify.toml`            |
| Help Center | `astro.help.config.mjs` | `src-help/` | `dist-help/` | `sites/help/netlify.toml` |

The marketing site is being rebuilt from a new design and is pre-launch (noindexed).
The Help Center is live, sealed from the rebuild (`src-help/README.md`), and edited in
CloudCannon (`docs/cms-publishing-workflow.md`).

## Setup

Requires Node 24 (`.nvmrc`) and pnpm (version pinned in `package.json`).

```bash
pnpm install
pnpm dev        # marketing site at http://localhost:4321
pnpm dev:help   # Help Center at http://localhost:4322
```

GA4 and the Intercom Messenger only render in production builds with their ids set; see
`.env.example`.

## Checks

```bash
pnpm verify       # marketing: typecheck, lint, format, tests, build, link/asset check
pnpm verify:help  # Help Center: CloudCannon config, build, editable regions, link/asset check
```

CI runs both on every pull request and on `main`.

## Where things are

- `CLAUDE.md`: project context and rules (start here, human or agent).
- `tasks/rebuild-plan.md`: the rebuild plan; `tasks/todo.md`: what's open.
- `src/pages/`: marketing routes; each keeps its copy in a `content` object at the top.
- `src/content/help/`, `src/data/help-ui.json`: Help Center content (CloudCannon-owned).
- `scripts/`: build checks (`check-dist`, `compare-builds`, `check-editables`, …) and
  the HubSpot contact-form builder.
