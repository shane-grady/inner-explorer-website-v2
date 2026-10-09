# Inner Explorer Help Center

Welcome. This is the editing home for the Inner Explorer Help Center at [help.innerexplorer.com](https://help.innerexplorer.com/).

## Start here

- [Help](cloudcannon:collections/help) — update or create a Help Center article.
- [Site Settings](cloudcannon:collections/data) — edit the text every Help Center page shares: the header, footer, sidebar, home page, and 404 page.

The main Inner Explorer website is not edited here. For a change to it, ask the website team.

## What you can change

Help articles share one approved layout. Edit each article's title, summary, group, search keywords, and body. In the body, use the Insert menu for figures, tables, videos, callouts, steps, accordions, cards, link cards, and action links. These options preserve the Help Center's responsive design and accessibility. For a new kind of block or a design change, ask the website team.

Use the image or video picker for media fields.

## Save and publish

1. Preview the change and select **Save**.
2. In **What changed and why?**, write one friendly sentence, such as “Updated the rostering steps and corrected two links.”
3. Save once. CloudCannon records the change in the website repository and starts the normal checks and builds automatically.
4. Open **Builds** and wait for the newest CloudCannon build to finish successfully. This confirms the editor preview passed its checks.
5. Open the [Help Center](https://help.innerexplorer.com/) before treating the change as live. Its Netlify deployment is separate from the CloudCannon preview and can finish at a different time.

The Build or Activity screens may show work in progress for a few minutes. A successful CloudCannon status means the saved version passed the editor-preview checks; it does not by itself prove the public Netlify deployment finished. If a deployment fails, visitors continue to see its last successful version.

## If saving or syncing pauses

- Stop editing that item and leave the page open.
- Do **not** discard changes, switch branches, or repeatedly retry.
- Take a screenshot of the error and note what you were editing and when you selected Save.
- Send those details to the website maintainer. The maintainer will preserve the held work before repairing the sync.

If a saved change causes a failed build, send the build message to the website maintainer. They will reverse that exact saved change and let CloudCannon resync; you do not need to recreate or discard your work.

## Accounts

Use your own CloudCannon account so every save shows who made it. Never share passwords or add editing credentials to the public website.

## For the website maintainer

CloudCannon builds the Help Center site itself: build command `pnpm verify:help`, output path `dist-help`. That command validates this configuration, builds the Help Center, checks every editable region (`pnpm lint:editables`), and checks every link and asset in the build. `.cloudcannon/initial-site-settings.json` records these values, but CloudCannon reads it only when a Site is first created. On the existing Site, change them by hand in **Site Settings › Builds**.

Article figures upload to `src-help/assets/images/`, the folder the Help Center build optimizes them from. Videos and poster images upload to `public/videos/help/`. Any other upload (a file picked for a link, a file-browser upload) goes to `public/images/` and is served as-is at `/images/…`.
