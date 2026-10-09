# Tasks: Inner Explorer rebuild

Open items; tick them off as PRs land. Plan and rules: `tasks/rebuild-plan.md`. Design:
the canvas "Inner Explorer — Website", page **FINAL V**
(https://claude.ai/artifact/6gx8tapeaDzTeSSMD7R31s), on the design system
https://claude.ai/artifact/XSmeot9ufJMTTvGDh3GYxz. Old log: `tasks/archive/todo-pre-rebuild.md`;
removed code comes back with `git show 0c8cac2:<path>`.

## Before build: confirm

From the canvas's "Before build — confirm" notes (read 2026-10-09; About, Platform and Why are on
FINAL V, Home and Research on their working pages), plus the plan's design questions. Names are
the owners the canvas gives.

- [ ] **Site-wide:** one CTA label everywhere. Plan default "Contact us"; the canvas also proposes
      "Talk to our team" / "Learn more" / "Contact us" and dropping "demo"; Home's header says
      "Book a walkthrough"; Research lists four variants.
- [ ] **Site-wide:** reconcile stats. Home/Why 60% / 43% / 28% vs Research −63% / −34% / +15%;
      Why's 15% higher GPA vs 28% higher grades; 43% less stress is student stress in one place,
      teacher stress in others; "CASEL-aligned" vs "CASEL approved" (verified: "SEL-Supportive
      Program", see `seo-playbook.md`); "BrainFutures" vs "Brain Futures".
- [ ] **Site-wide:** sources for 90% of schools renew, Medicaid and private-insurance
      reimbursement, 372+ students per counselor, Home's 4 research stats (10% higher attendance
      is new).
- [ ] **Site-wide:** linked routes that don't exist: `/roi-calculator`; `/newsletter`,
      `/educators`, `/careers` only redirect today. Build, keep the redirect, or relink.
- [ ] **Design:** big stat-number face. Plan default: Libre Caslon Condensed 500 at 72/56/44
      (mobile 56/44/40). The canvas's Component decisions board (8 Oct) kept every face as drawn
      instead, on one size ramp: 112/72/56/44 (mobile 72/56/44/40).
- [ ] **Design:** feature icon holder, default Emerald disc (README) vs the board's mint. The
      Remaining drift board (8 Oct) says "bare icon or a 48px Emerald disc", matching the default.
- [ ] **Design:** accent-bar gap, README 8px vs boards 16px (default 16). Research puts the bar
      under one word ("biology"); the design system draws it at title width.
- [ ] **Design:** input radius, Library 12px vs Contact board 8px (default 12).
- [ ] **Design:** mobile menu open state, sticky header, current-page indicator in the light
      header are not designed (default: built accessibly, as `MobileMenu` describes).
- [ ] **Design:** Footer A vs B, the "501(c)(3) nonprofit" line, social profile URLs (default:
      Footer A, social icons hidden until URLs exist).
- [ ] **Home:** school logo files (with permission) and approved photos for the Section 3
      mosaic; the Section 10 sample practice and its transcript.
- [ ] **Home:** keep the FAQ ("Questions leaders ask") beside Funding? It isn't in the outline.
      The Dwight Morrow quote ends "the stress day" (as on the live site): "stressful day"?
- [ ] **Platform:** High School sample practice name; an approved educator quote on ease of use
      (Section 6); confirm the practice feedback feature exists as described (Section 3). Juliana.
- [ ] **Platform:** four sample audio practices with transcripts, one per age level (Shane,
      Lisa); nine platform screenshots for Sections 3, 5, 6 (Shane); student images from the
      internal library (Lisa, Juliana) and a better hero photo.
- [ ] **Platform:** Evidence and "In their words" still say "five mindful minutes", "K–12",
      "district-wide" and quote the family app: update or cut.
- [ ] **Why:** pick a Seven Reasons layout (options A–H on the canvas). Approve or cut what was
      kept from the old design: hero stat strip and checks, green eyebrows, the 2 vs 25 Sarasota
      band, Foundation diagram, MTSS pyramid, Funding guarantee tile, closing band.
- [ ] **Why:** ROI estimator coverage 85/100/60/75% are draft values; $8 per student vs the
      draft's $4.20; sources for $50 per avoided suspension or absence day and $20,000 per
      teacher kept (the full calculator is parked while Laura reworks it). Swap borrowed photos.
- [ ] **Research:** ESSA Tier 1, name the study or review the badge cites. "Independent academic
      researchers": Bakosh 2016 and 2018 are led by Inner Explorer's co-founder and Chief
      Research Officer, so add a disclosure? Bakosh details disagree with About (2015, J. Applied
      School Psychology, 50% fewer incidents vs 2016, Mindfulness, +18% reading, "Univ of London").
- [ ] **Research:** charts. +15% GPA and +11% science trace to no single study; "quarterly grade
      points" vs % values; "Burnout +12%" reads as rising and says "vs. baseline" though Lopez
      2020 used a waitlist control; are the week 2/4/6 student-stress points reported values?
- [ ] **Research:** unsourced "Two of every three children", "16,000+ studies", "40+ years of
      MBSR", "tens of thousands of classrooms", the EEG/eye-tracking finding, "roughly half the
      rate"; Loyola Marymount missing from citations; status of Lopez 2020 and Dunlap; URLs for
      Lopez, Stager, Dunlap, Phan; the summary PDF and the AI brief link.
- [ ] **About:** real team headshots (stand-ins don't match names: Rachel Park, Jamal Carter,
      David Chen); partner logo files, with permission; voice avatars are initials and quotes
      anonymized: OK? Milestones cut from 9 to 5: approve.
- [ ] **About:** verify 487M minutes (2025), 94% calmer in 4 weeks, 14 countries, 12+ university
      partners.
- [ ] **Case Studies:** the 7 pre-rebuild YAMLs (`0c8cac2:src/content/case-studies/`) carry
      PUBLISH GATE and REVIEW comments: stand-in portraits, invented student voices,
      representative trust figures, inferred dates, La Joya's 85% vs 80%, the 43% educator-stress
      figure. Resolve each before its value reaches a new page.

## Build order

- [ ] Design-foundation PR (`rebuild-plan.md` › Next PR: the design foundation).
- [ ] Contact, with the success state; style the HubSpot form (`ie-field`, `ie-label`).
- [ ] Home.
- [ ] Platform.
- [ ] Why Inner Explorer (SEO copy is on the canvas's "SEO (for build)" note).
- [ ] Case Studies index and 7 details; PDFs from `0c8cac2:public/downloads/`; update the
      `transfer-case-study` skill.
- [ ] Newsroom and Article: the 18 legacy posts word for word ("Blog Posts Working" page), the 2
      real posts from `0c8cac2:src/content/blog/` (`inner-explorer-mtss-tiers`,
      `mindfulness-for-student-athletes`), legacy blog 301s, `/blog` vs `/newsroom` breadcrumbs.
- [ ] Research: snap its off-ramp title sizes (68px sections, 36–38px cards; Remaining drift
      board).
- [ ] Pricing: port the design system's `PricingTable`; data from
      `0c8cac2:src/content/pages/pricing.yml`; snap its 48px section title to the ramp.
- [ ] About.

## Launch

- [ ] Point www.innerexplorer.com at the marketing Netlify site (the legacy site serves it today).
- [ ] Legacy 301 map, on www.innerexplorer.com and the lms.innerexplorer.org copies, with and
      without `.html` (context per story: "Open follow-ups" in `tasks/seo-playbook.md`):
      `/case-study1` to `/case-study7` → `/case-studies/` `kaiser-elementary`, `dwight-morrow`,
      `goddard-middle-school`, `webb-school`, `john-marshall-hs`, `la-joya-isd`,
      `mindful-michigan` (in that order; match the Case Studies PR's slugs), each with its PDF
      (`/images/HJK-Elementary.pdf`, `Webb-School.pdf`, `John-Marshall-HS.pdf`, `La-Joya-ISD.pdf`,
      `Mindful-Michigan-Model.pdf`; find case studies 2 and 3's); `/mbsel.html` → Webb; the 18
      posts at `/blog-index` → their Newsroom URLs; `/compare_program` → `/pricing/`. Then crawl
      the legacy site for anything else that ranks or is linked.
- [ ] Remove the PRE-LAUNCH noindex `[[headers]]` blocks in `netlify.toml` and
      `sites/help/netlify.toml` (help.innerexplorer.com is noindexed too). Keep the
      `*.netlify.app` edge functions.
- [ ] Favicon and touch icon from the design system's `mark-compass`. Both sites read
      `public/favicon.ico` and `apple-touch-icon.png`, so the Help Center changes too.
- [ ] Search Console: verify www.innerexplorer.com, submit the sitemap. If not done yet, file a
      Removals request for `innerexplorerwebsitev2.netlify.app` (indexed in 2026-06; it has sent
      `noindex` since, checked 2026-10-09).
- [ ] Help Center reskin onto the new design system; retires the frozen copies in `src-help/`.
- [ ] Bring CMS editing back for marketing pages, if wanted.

## HubSpot and other owner items

- [ ] CloudCannon, right after this PR merges: Site Settings › Builds → `pnpm verify:help`,
      output `dist-help`; rebuild; the editor lists only Help, no red cards, Syncs clean
      (`rebuild-plan.md` › Your manual step).
- [ ] HubSpot contact form: the confirmation says "We just sent a confirmation to your inbox",
      but nothing sends one. Add a follow-up email on the form, or change the copy.
- [ ] HubSpot: confirm the contact form's notification recipients; delete the 2026-08-25 test
      contact (record 244309307539) if it's still there.
- [ ] HubSpot forms the boards need beyond Contact: newsletter signup (Research, Article), the
      gated research summary PDF, case-study PDFs gated by work email. Decide which exist at
      launch; script them like `scripts/hubspot-contact-form.mjs`.
- [ ] Netlify (marketing site): delete the dead `demo` form; the contact form posts to HubSpot.
- [ ] Intercom, platform engineer: add `ie_source: 'Platform'` to the platform's Messenger boot
      and turn on identity verification (JWT). See `tasks/intercom-setup.md`.
- [ ] Privacy policy (Juliana, counsel): the callout's "educator-led, whole-classroom program"
      reads against the house rule that the audio guide leads the practice. Flagged, not
      reworded: legal copy moves verbatim. No terms of service exists; counsel supplies one if
      wanted at launch.
