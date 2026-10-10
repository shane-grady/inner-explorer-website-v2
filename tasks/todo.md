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
- [x] **Design:** settled from the FINAL V boards in the foundation PR (`rebuild-plan.md` ›
      Design questions): four stat faces on one ramp, Emerald disc, 8px accent-bar gap, 8px
      inputs, Footer A without the 501(c)(3) line, static header.
- [ ] **Design (provisional, confirm):** the open mobile menu (V2's spec), the light header's
      current-page rule, the field error state. All on `/styleguide/`.
- [ ] **Footer:** social profile URLs (LinkedIn, Instagram, Facebook, YouTube, X); the row ships
      when they exist. The boards' sign-off line was dropped on 2026-10-10.
- [ ] **Home (built from FINAL V; these came from the working page):** FINAL V's Home has no
      photo mosaic, sample-practice player, FAQ or Dwight Morrow quote, so none was built. Bring
      any back, or close this.
- [ ] **Home, stand-ins (`src/assets/images/home/`):** the three hero photos, the video poster,
      the three product screens (routine steps), the program photo, the closing-CTA photo, and
      the "One shared foundation" dashboard (Brightwater Unified, sample figures; decorative).
      Approve or replace each.
- [ ] **Home, partner row:** hidden (2026-10-10, as the desktop board has it "until approved";
      the mobile board shows it). `blocks/LogoStrip` is built and on `/styleguide/`; to restore,
      add `<LogoStrip>` after the pillars with the names (Broward County, La Joya ISD, Racine
      Unified, LAUSD, Greece) or approved logo files.
- [ ] **Home, research panel:** the desktop board cites Bakosh 2016 (eight 3rd-grade classrooms,
      one bar pair); the mobile board cites Lopez 2020 (RCT, 39 Head Start classrooms, with a
      control group at +10%). Built the desktop version at both widths: pick one. Also confirm 2M+
      students, 4,000+ schools, 90% renewal, 15% GPA, 43% educator stress, 16,000+ studies,
      "Top EdTech Products 2025" and "BrainFutures Top 10" (and the site-wide items above).
- [ ] **Home, copy:** verbatim from the boards, title case included ("Calm Minds / Learn
      Better", "Talk to Our Team", "Contact Us"), against the plan's sentence-case and "Contact
      us" defaults (the site-wide CTA item). The header and footer keep "Contact us".
- [ ] **Home, links the board leaves as `#`:** "Experience daily practice" (card and the mobile
      sticky bar's play button), "Explore the library" and the four grade bands go to
      `/platform/`; "See the research" to `/research/`. "See cost and funding options" goes to
      `/why-inner-explorer/#funding`: the Why PR needs that id. Retarget once those pages exist.
- [ ] **Home, video:** the poster opens YouTube in a new tab; the board's note proposes a
      captions-on `youtube-nocookie` embed instead. Linking out loads nothing third-party; keep it,
      or embed on click.
- [ ] **Home, remaining drift (snapped to the ramp):** pillar titles 26 → 22 drawn, 28 → 24
      built; Settled 22 drawn, 24 built at desktop; grade-band names 20 on mobile, 18 built; the
      mobile closing-CTA photo 240 drawn, 220 (the shared block, as About draws it); the carousel
      dots 16px apart (24px targets, WCAG 2.5.8); mobile Research follows the desktop study (item
      above); Footer A has no social row (footer item above).
- [ ] **Platform (built from FINAL V; confirm before launch):**
  - Stand-ins (`src/assets/images/platform/`), all as the boards draw them: the hero product
    screenshot, the four program photos, the daily-practice photo, the dashboard screenshot, the
    classroom photo and the closing-CTA photo (9 files; the board note asks for a better hero photo
    and student images from the internal library: Lisa, Juliana). The three product mocks built in
    markup (the "Day 14 of 180" card, Recommended actions, the Gratitude reflection card) stand in
    for platform screenshots (Shane); they are `aria-hidden`.
  - Sample practices (Shane, Lisa): four audio files with written transcripts, one per program,
    and their lengths (the players show 0:00 / [length]). Each player is built and stays disabled
    until both `audio` and `transcript` are set in the page's `content` (a "Read the transcript"
    disclosure then appears; audio never ships without its text alternative). The High School
    practice name still reads "[High School sample practice: TBD]" (Juliana).
  - Facts (Juliana): the practice feedback feature as described ("Feedback after every practice");
    180 daily practices of five to ten minutes; ten hours of asynchronous PD; "COPPA, FERPA, and
    SOPIPA", DPAs on request; "Every practice is checked for developmental fit"; the four evidence
    figures and sources (+15% GPA, Bakosh 2016; −80% referrals, MeckPreK; +26.6% / +22%, Dunlap 2023) and the site-wide stats item. The boards disagree on the first evidence card: desktop
    "+15% / Higher average GPA", mobile "+20.6% / Higher science grades"; built the desktop card at
    both widths: pick one. Grade ranges: the main boards say Middle School 5 to 7 and High School 8
    to 12; the "Programs, green version" compare board says 5 to 8 and 9 to 12.
  - Copy flagged by the board's note: Evidence still says "5 mindful minutes" (title) and
    "four decades of mindfulness science". "K–12" now reads "PreK–12" on the boards. "In their
    words" (the family-app quote, "district-wide") was removed from the main boards and saved on a
    working-page mockup, so it was not built; the family app appears nowhere on the page.
  - The "Just Press Play" quote ("Educator, Massachusetts") is the board's placeholder until an
    approved educator quote on ease of use arrives (Juliana).
  - SEO: the JSON-LD ported from `0c8cac2` listed the old three apps (Classroom app, District
    dashboard, Home family app); it now lists the four programs. The meta description is new (the
    hero lead; the old one named the three apps and K-12). The title is kept.
  - Copy casing as drawn: "Evidence-Based Mindfulness That Fits Into Every Classroom", "Just Press
    Play", "Student Privacy, Built In" (the site-wide CTA item); every contact CTA says "Contact us".
  - Not built: the "Programs, green version" compare board (the main boards' white section won).
  - Drift left after the side-by-side review (2026-10-10; desktop sections within 13px of the
    board, mobile within 45px): the hero buttons sit 8px lower (PageTitle's 40); player meta,
    times and mock rows at 14 (board 12–13, the "nothing under 14 but tags" rule), so the mobile
    player meta wraps to two lines; the reflection prompt 20 (board 19); the closing CTA runs 38px
    shorter on desktop (the shared block's 72px padding and 520 lead, board 80×64 and 440).
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
- [ ] **About (built from FINAL V; confirm before launch):**
  - The FINAL V boards have no voices section (so no voice avatars), no milestones, and none of
    "487M minutes", "94% calmer in 4 weeks", "14 countries" or "12+ university partners"; none
    was built. The earlier items about them are closed by the board.
  - Stand-ins (`src/assets/images/about/`), all as the board draws them: the 10 headshots
    (Laura Bakosh, Lisa Grady, Jillian Sullivan, Laurie Grossman, Travis Grady, Fard Morales,
    Jonathan Filzen, Liz White, Lawrence Love, Juliana Pulselli; Laurie Grossman's file is 121px
    and Lisa Grady's 272px, soft at their sizes); the 12 partner logos + Logictry's mark
    (`logos/`, with permission to show each); the 9 press logos (NBC is one file for Chicago and
    Atlanta; "People" is set in type, no logo); the hero, the two Journey photos, the closing-CTA
    photo. Supply or approve each.
  - Facts: headquartered in Sarasota, FL; all 50 states; 4,000+ schools; 6 controlled studies,
    four of them randomized trials; a 77-study meta-review of 12,358 students; the 2025 hybrid
    structure and the Legacy Global Programs fiscal sponsorship; the Institute card's label
    "Nonprofit · 501(c)(3)" (the copy says the sponsor is the 501(c)(3)); every team title and
    advisory role (Lori Katz, J.D. has none on the board); the partner list.
  - Links: AP, Fox News, NBC Chicago and People point at HubSpot sales-engage tracking redirects
    (`d5hf9n04.na1.hs-sales-engage.com`), as drawn: replace with the stories' own URLs. The board
    notes the press row moves to Newsroom Press posts later.
  - JSON-LD (ported from `0c8cac2`): the old Organization description's "A 501(c)(3)
    nonprofit." was dropped against the 2025 structure; founders stay Dr. Laura Bakosh and
    Janice Houlihan (the board names Laura Bakosh and Lisa Grady as co-owners): confirm. The
    meta description is new, from the hero lead (the old one said "2.4 million students").
  - Copy casing as drawn: "Contact Us", "Explore the Research", "The People Behind Inner
    Explorer", "See How Inner Explorer Works" (the site-wide CTA item).
  - Drift left after the second side-by-side review (2026-10-10; where the boards disagree the
    desktop board wins, so the stat labels and research intro let "Inner Explorer" break as
    desktop does): the hybrid paragraph's trailing empty line dropped (Journey 27px shorter at
    both widths); the closing CTA's buttons sit 32px under the lead (board 40; the shared block,
    as Home draws it); "People" and "Logictry" 19 on mobile (board 24 / 20); Logictry's mark 36
    at both widths (board 30 on mobile); the mobile gap above "Advisory Board" follows the
    desktop rhythm (the mobile board splits there).
- [ ] **Contact:** the hero photo is the board's stand-in (`src/assets/images/contact/`):
      approve it or supply one. The H1 is title case on the boards ("Get in Touch With Inner
      Explorer") against the sentence-case rule: keep or change.
- [ ] **Contact (HubSpot, run `scripts/hubspot-contact-form.mjs`):** labels "School name
      (optional)" and "Message for our team (optional)" as the boards draw them, then drop the
      red required asterisk; placeholders "you@yourschool.org" (Email) and "e.g. Brightwater
      Unified" (District name); submit text "Contact us" (it says "Submit"; the board "Contact Us",
      and the board's arrow can't sit on HubSpot's `<input>`); make ROWS mirror the board's
      grouping (CSS already places each field by name, `components.css` › `[data-hsform]`).
- [ ] **Contact:** HubSpot's error lists put `role="alert"` on the `<ul>`, so axe flags
      `listitem` once an empty form is submitted. It's HubSpot's markup and the loader stays
      untouched: accept it, or ask HubSpot for a fix.
- [ ] **Contact:** the boards' "support panel" state (Back to the form, Copy the address) has no
      control that opens it, so it wasn't built. Confirm it's dropped.
- [ ] **Pricing (built from FINAL V; confirm before launch):**
  - Facts: the three prices ($1,200 / $2,800 / $3,600) and every add-on price; the Advanced
    Wellness Program's $5,800 / $2,200, its includes, and "Pricing is set independently of any
    reimbursement…"; "Our team replies within 1 business day"; "FETC finalist 2025",
    "BrainFutures named top 10 executive functioning", "CASEL approved" (the site-wide item:
    "SEL-Supportive Program"); "Districts of 10 or more schools qualify for districtwide pricing"
    and the Title IV-A / BSCA / state SEL funding line; what "the Inner Explorer guarantee" /
    "performance guarantee" promises.
  - Board vs the old YAML: the board renames two Overview rows ("BrainFutures top 10
    recommendation", "FETC finalist, top edtech program") and moves Reflective journaling to
    Programming; built as the board draws it.
  - Community Pro blurb: the desktop board's wording (no "roster management", which the mobile
    board and the old YAML have), chosen 2026-10-10.
  - CTA labels: every contact CTA says "Contact us" (the board's "Contact us for districtwide
    pricing" and "Talk to our team" included), per the site-wide CTA item.
  - Behavior the board leaves static: "Show only differences" works (hides the 22 rows whose
    three cells match, updates the counts); the table starts collapsed at 640px and expands on
    Expand or when focus moves under the fade; without JS it renders whole.
  - Drift left after the side-by-side review (2026-10-10): 11–13px micro text set at 13–14 (the
    "Nothing under 14 but tags" rule), so the mobile table header's units and the add-on notes
    wrap to two lines and the table runs about 35px (desktop) / 100px (mobile) taller; group
    and footer titles on the ramp (20 for 22); "Programs and add-ons" 28 (board 32); the
    switch track has a 1px outline for 3:1.
  - No stand-in images on this page.
- [ ] **Case Studies:** the 7 pre-rebuild YAMLs (`0c8cac2:src/content/case-studies/`) carry
      PUBLISH GATE and REVIEW comments: stand-in portraits, invented student voices,
      representative trust figures, inferred dates, La Joya's 85% vs 80%, the 43% educator-stress
      figure. Resolve each before its value reaches a new page.

## Build order

- [x] Design-foundation PR (`rebuild-plan.md` › The design-foundation PR).
- [x] Contact, with the success state; style the HubSpot form (`ie-field`, `ie-label`).
- [x] Home: `blocks/PhotoHero`, `StatStrip`, `LogoStrip`, `ui/VideoPoster`; the white
      `ClosingCta` with photo; Testimonial emphasis.
- [x] Platform: `blocks/EvidenceCard` (shared with Research), segmented tabs and sample players
      (page-only), `--shadow-lifted`; board assets as stand-ins (Before build › Platform).
- [ ] Why Inner Explorer (SEO copy is on the canvas's "SEO (for build)" note).
- [ ] Case Studies index and 7 details; PDFs from `0c8cac2:public/downloads/`; update the
      `transfer-case-study` skill.
- [ ] Newsroom and Article: the 18 legacy posts word for word ("Blog Posts Working" page), the 2
      real posts from `0c8cac2:src/content/blog/` (`inner-explorer-mtss-tiers`,
      `mindfulness-for-student-athletes`), legacy blog 301s, `/blog` vs `/newsroom` breadcrumbs.
- [ ] Research: snap its off-ramp title sizes (68px sections, 36–38px cards; Remaining drift
      board).
- [x] Pricing: plan cards, the comparison table (built from the FINAL V boards, not the design
      system's `PricingTable`), the Advanced Wellness panel, `ClosingCta layout="inline"`; data
      from `0c8cac2:src/content/pages/pricing.yml`, board wins; the 48px title snapped to 44.
- [x] About: `LogoStrip layout="wall"` (partners and press), Emerald panels, the facts card
      over the hero photo; board assets as stand-ins (Before build › About).

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
