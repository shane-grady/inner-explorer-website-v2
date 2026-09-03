# Inner Explorer website

Welcome. This is the editing home for the Inner Explorer marketing website and Help Center.

## Start here

- [Marketing Pages](cloudcannon:collections/pages) — edit page copy, images, links, and search descriptions.
- [Blog](cloudcannon:collections/blog) — update or create a blog post.
- [Help](cloudcannon:collections/help) — update or create a Help Center article.
- [Site Settings](cloudcannon:collections/data) — edit navigation, footer, and shared Help Center text.

You can also edit [Case Studies](cloudcannon:collections/caseStudies),
[Narrators](cloudcannon:collections/narrators),
[Practice Series](cloudcannon:collections/series), and
[Testimonials](cloudcannon:collections/testimonials).

## What you can change

Pages have fixed, approved layouts. Edit the content and media shown in CloudCannon. Some lists let you add, remove, or reorder items when the layout supports it. For a new section, a different section order, or a design change, ask the website team.

Use the image or video picker for media fields. In blog and Help writing, use the Insert menu for figures, quotes, statistics, cards, audio, callouts, steps, accordions, and action links. These options preserve the site's responsive design and accessibility.

## Save and publish

1. Preview the change and select **Save**.
2. In **What changed and why?**, write one friendly sentence, such as “Updated the back-to-school resources and corrected two links.”
3. Save once. CloudCannon records the change in the website repository and starts the normal checks and builds automatically.
4. Open **Builds** and wait for the newest CloudCannon build to finish successfully. This confirms the editor preview passed its checks.
5. Open the [V2 staging site](https://innerexplorerwebsitev2.netlify.app/) and [Help Center](https://help.innerexplorer.com/) before treating the change as live. Their Netlify deployments are separate from the CloudCannon preview and can finish at different times. The legacy `innerexplorer.com` site is not changed by this workflow.

The Build or Activity screens may show work in progress for a few minutes. A successful CloudCannon status means the saved version passed the editor-preview checks; it does not by itself prove either public Netlify deployment finished. If a deployment fails, visitors continue to see its last successful version.

## If saving or syncing pauses

- Stop editing that item and leave the page open.
- Do **not** discard changes, switch branches, or repeatedly retry.
- Take a screenshot of the error and note what you were editing and when you selected Save.
- Send those details to the website maintainer. The maintainer will preserve the held work before repairing the sync.

If a saved change causes a failed build, send the build message to the website maintainer. They will reverse that exact saved change and let CloudCannon resync; you do not need to recreate or discard your work.

## Accounts

Use your own CloudCannon account so every save shows who made it. Never share passwords or add editing credentials to the public website.
