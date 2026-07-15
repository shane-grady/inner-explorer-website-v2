# Inner Explorer website

Welcome. This dashboard is the editing home for the public Inner Explorer website.

## Quick links

- [Blog posts](cloudcannon:collections/blog)
- [Case studies](cloudcannon:collections/caseStudies)
- [Help Center articles](cloudcannon:collections/help)
- [Narrators](cloudcannon:collections/narrators)
- [Practice series](cloudcannon:collections/series)
- [Testimonials](cloudcannon:collections/testimonials)

## How editing works

Open an existing blog post, case study, help article, narrator, or practice series in the Visual Editor to see the published layout while you work. The Content Editor is also available for blog and Help Center writing, and the Data Editor is useful for structured lists such as statistics, quotes, galleries, and calls to action.

New blog and Help Center articles open in the writing view first because drafts do not yet have a published preview page. New structured stories open in the form view. Preview pages shown during creation are examples only; the new item's own page appears after the next successful build.

## Images

Use the image picker on image fields. Structured page images are stored with the site's optimized source images, while images inserted directly into long-form writing are intentionally disabled. Use the Figure or Help figure component instead so images keep responsive sizing and required alternative text.

## Rich-text components

The insert menu includes pull quotes, figures, statistics, resource cards, audio practices, callouts, steps, card grids, link cards, accordions, and action links. Use these components instead of pasting custom markup; they preserve the site's design and accessibility behavior.

## Publishing

Save changes as drafts while reviewing. Publishing writes the approved content change back to the site's Git repository and triggers the normal site build. If a build fails, do not retry with altered formatting; share the build message with the website maintainer.

## Access and review

Every team member should use their own CloudCannon account. Assign the lowest
appropriate permission group and use a review/publishing branch before production;
do not share a password or add a secret editing passcode to the public website.
