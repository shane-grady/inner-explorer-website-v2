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
      `/why-inner-explorer/#funding` (the Why page has that id). Retarget the rest once those pages
      exist.
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
  - Sample practices (Shane, Lisa): names set 2026-10-12 (Early Learning "Day 3: Introduction to
    Breathing", Elementary "Day 8: Shark Fin Anytime", Middle "Day 9: Observing Thoughts", High
    "Day 13: Introduction to Observing Senses"). Still needed: the four audio files (under
    `public/audio/`) and a written transcript for each. A player stays disabled, with no time
    row, until both `audio` and `transcript` are set in the page's `content` (a "Read the
    transcript" disclosure then appears; audio never ships without its text alternative). The
    duration comes from the file; `length` is optional.
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
  - Drift left after the second side-by-side review (2026-10-10; desktop sections within 5px of
    the board, mobile within 45px; mobile H2s balance their lines, as the mobile boards set): the hero buttons sit 8px lower (PageTitle's 40); player meta,
    times and mock rows at 14 (board 12–13, the "nothing under 14 but tags" rule), so the mobile
    player meta wraps to two lines; the reflection prompt 20 (board 19); the closing CTA runs 38px
    shorter on desktop (the shared block's 72px padding and 520 lead, board 80×64 and 440).
- [ ] **Why (built from FINAL V; confirm before launch):**
  - Seven Reasons: built as the FINAL V boards draw it (each photo on a half-bleed Emerald
    panel, "Reason N — 0N / 07"), chosen 2026-10-10. The A–H options board the canvas note
    mentions is no longer on the canvas, so that pick is closed by the board.
  - ROI estimator: not built. FINAL V doesn't draw it; the "Parked module" board (WHY IE Working)
    says it was removed 2026-10-08 while Laura reworks the numbers (85/100/60/75% coverage, $8 per
    student vs the draft's $4.20, $50 per avoided suspension or absence day, $20,000 per teacher
    kept). The interactive estimator, and whether `/roi-calculator` exists, is a later PR.
  - Kept from the old design, as the boards draw them (approve or cut): the green eyebrows, the 2
    vs 25 Sarasota band, the Foundation diagram, the MTSS pyramid, the closing band. FINAL V has no
    hero stat strip, "at a glance" checks or Funding guarantee tile, so none was built.
  - Stand-ins (`src/assets/images/why/`), all as the boards draw them: the hero photo, the seven
    reason photos (`reason-funding.jpg` is 320 × 146 and soft at its 512px size), the curriculum
    photo, the closing photo. The canvas says they come from the case-study and About libraries;
    none matched a file already in the repo. Reason 7's photo shows two teachers holding "Top 10"
    certificates: confirm the people and the award. The compass mark (`src/assets/brand/
mark-compass.png`, 256px PNG) is the board's: an SVG from the design system would be sharper.
  - Facts, as drawn: 90% of schools renew; 43% less teacher stress (Bakosh 2018; Reason 7 says the
    same 43%); 21% higher state math scores (Stager 2022); 56% fewer suspensions, Fulton County,
    GA; the Sarasota principal's 2 vs 25 referrals; Under $8 per student per year, "about 0.07% of
    per-student spending"; 372+ students per counselor; the reimbursement paragraph; "180 days a
    year"; "5 to 10 minute practice"; the Killeen and Palm Springs principals' quotes (and the
    site-wide stats and sources items above).
  - SEO: title and meta description from the canvas's "SEO (for build)" note. Its Open Graph title
    ("Why Inner Explorer") and description ("Learning starts with regulation. See how…") differ
    from the meta ones; `PageLayout` uses one pair for both, so OG shows the meta pair. Add OG
    props to `SEO`, or keep one pair. No Why page existed at `0c8cac2`; the JSON-LD follows the old
    `/districts` page's shape (WebPage, EducationalAudience, Service).
  - Built as rendered, not as written: the MTSS "The foundation" card's 4px Emerald top border is
    overridden by the board's own `border` shorthand, so both boards show a 1px Raised card. Add
    the top border back if it was meant.
  - Copy: verbatim, the boards' non-breaking spaces kept; where the boards disagree the desktop
    board wins (the Palm Springs quote's "students'"). "Why every day matters" is stored in
    sentence case and renders uppercase, as the desktop board shows it.
  - Drift left after the second side-by-side review (2026-10-10, measured element by element;
    every image within 4px at both widths, desktop sections within 5px of the boards but the
    curriculum section, 19px shorter for its 64 statement): the hero's eyebrow, lead and buttons
    sit 4–8px off (PageTitle's shared 24/32/40 spacing, boards 20/28/36); type snapped to the ramp
    (the 68 statement 64, curriculum cells 22 → 20 and heads 26 → 28, the figure caption, base
    bar and funding-panel titles 22 → 20, tier numerals 22 → 20, mobile: the statement 28 → 24, the
    criteria panel 26 → 24, the funding-panel title 20 → 18 (wrapping to two lines, board three),
    the result statement 20 → 19); the curriculum discs are 22 (board 24); the mobile legend uses
    the 10px swatch (board 16); copy follows the desktop board where the boards disagree (the
    Palm Springs quote's straight apostrophe).
- [ ] **Research (built from FINAL V; confirm before launch):** built from the four
      Research-Experiment boards (FINAL V since Oct 8). Every stat, study detail, citation and
      partner is as drawn and unconfirmed. Kept flagged:
  - ESSA Tier 1 · Strong evidence: name the study or review the badge cites.
  - "Six independent controlled studies" / "all led by academic researchers": Bakosh 2016 and
    2018 are led by Inner Explorer's co-founder and Chief Research Officer. Add a disclosure?
  - Bakosh details disagree with About (2015, J. Applied School Psychology, 50% fewer incidents vs
    2016, Mindfulness, +18.8% reading, "University of London"). The boards disagree on S1's "Overall
    GPA": +15% on desktop, +16% on mobile (built +15%). The Outcomes card links "Higher overall GPA"
    to Bakosh 2016: confirm the source of the GPA claim.
  - Unsourced on the page: "Two of every three children" (hero, deeper science, missing layer),
    "16,000+ studies", "four decades of science", the EEG/eye-tracking finding, "roughly half the
    rate", the 77 studies / 12,358 students / five continents.
  - Lopez 2020 is "Under review" with no URL; Dunlap 2023 is "Journal publication forthcoming,
    2026": confirm both. Phan et al. is "University of Pennsylvania" here and "Utah State Univ." on
    the timeline board.
  - Research partners: built with the board's five visible names. The board's hidden loop copy
    swaps "University of London" for "Loyola Marymount", and Loyola is in no citation. Add it
    (with its study) or drop it.
  - District results (MeckPreK −80%, Stephens Elementary −48%, GVSA −39%, PATHS −56%
    suspensions, "+10% Attendance" with no school named), "School- and district-supplied data,
    2025–26 school year": sources and permission to name each school.
  - The stats-reconcile item above (−60% / −43% / −28% here are the Home and Why figures; the
    old −63% / −34% / +15% are gone).
  - The AI library button goes to
    learn.innerexplorer.com/download-the-ai-and-mindfulness-resource-library, as drawn: confirm
    the page.
  - CTA copy verbatim: "Talk to our team" (hero and closing panel) against the site-wide "Contact
    us" item; the header keeps "Contact us".
  - SEO: the title is kept. The meta description is new (board phrases, PreK–12); the old one said
    "a meta-analysis of 77 more", "Forty years of MBSR" and "K-12". JSON-LD ported from `0c8cac2`
    (Article + the seven studies as ScholarlyArticle, now with Person authors and the board's DOI
    and ProQuest links).
  - No longer drawn on FINAL V, so closed with this note: the GPA/science, burnout ("+12%") and
    week-2/4/6 student-stress charts, "40+ years of MBSR", "tens of thousands of classrooms", the
    summary PDF and its form, `/newsletter`.
  - Where the boards disagree, desktop is built: the dose figure's "Practiced once" / "Practiced
    daily" (mobile "About once" / "Every school day", "practiced outside of class…"); S1's GPA.
  - Stand-ins: the neuron footage and still are the board's own (`public/videos/research/`,
    `src/assets/images/research/neurons.jpg`). The footage is decorative and silent, so it has
    no captions.
  - Built beyond the boards: a pause button beside the partners marquee (the board pauses it on
    hover only; WCAG 2.2.2); the controls (brain, wall, Show our work, Pause motion, citations)
    appear once the script runs, and without JS the details and citations render whole. Reduced
    motion starts on Mindful with the still frame, as the board note asks. The "Direction C ·
    Research timeline copy" board on FINAL V (a 7-card carousel) is not used by the page boards
    and was not built.
  - Drift left after the second, measured side-by-side review (2026-10-10; every text element on the
    four boards aligned with the build): desktop sections within 5px of the boards, but the fair
    question (21px shorter: its 52px title on the 44 step). Titles use the closest ramp step for
    fidelity, chosen over the Remaining-drift board's 44 / 28: 68 → 64 from lg, 38 / 36 → 40,
    32 → 28, step titles 24 → 28, rows 22 → 20; the hero H1 68 → 64 and lead 26 → 24. Labels drawn
    at 12–13px are 14 (the mobile wall's block labels wrap to three lines). The quote is 20 / 18
    (board 22), the mobile fair-question lead 18 (board 20) and the mobile statement 32 on four
    lines (board 30 on three), which with the quote makes mobile Why it works and A fair question
    ~80 and ~40px shorter. Study numerals 40 on mobile (board 44, EvidenceCard's step); the hero
    switch's track is white 12% (board 6%) and the pause chip opaque Forest (board 60%); the
    brain's glows and mindful label are snapped (DESIGN.md); Emerald eyebrows and the Spring "Here
    is the proof." on mobile (desktop board).
  - Outcome citations (2026-10-12, Lisa and Juliana in Slack: the arrows all "went to the same
    place"): the down arrows are gone; a citation turns on Show our work, scrolls the study card
    into view and outlines it (`.ie-spotlight`), so the claim's result is visible on arrival. A
    deep link `/research/#study-s3` lands the same way. Confirm with them.
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
- [ ] **Newsroom and Article (built from FINAL V; confirm before launch):**
  - MTSS post, the Article board's revision of the `0c8cac2` post (built as drawn): the dek
    ("fragmented set of programs" for "patchwork"), the Key takeaways, the pull quote, the stat
    tiles **77% fewer school-wide discipline events (Kaiser Elementary)** and **85% fewer
    behavior issues in special education classrooms (La Joya ISD)** (the case-study gate's
    85% vs 80%) in place of 60% / 43% / 28% / 10%, "16,000 studies" (was 15,000), the
    **Support Staff Series** (was Counselor Series; linked to `/platform/`, since `/series/…`
    doesn't exist), and a Tier 3 section without the Webb School paragraph (65% fewer
    outbursts). The FAQ's 60% / 43% / 28% and "under $8"; the panel's "4,000+ schools · All 50
    states · Under $8 per student per year" (the site-wide stats items).
  - Athletes post: the `0c8cac2` text verbatim (no FINAL V board draws it; one missing final
    period added). Its "Blog Posts Working" boards revise "over 14,000 peer-reviewed articles"
    to 16,000 and "a 15 to 28 percent improvement in academic performance" to "a 15 percent
    improvement in average GPA": not adopted. Its sources' figures (91%, 58%, 1 in 10, the NCAA
    study of 25 players) and the pro athletes' quotes.
  - Resource cards (Newsroom, 2026-10-12, the user's call): the board's two study tiles are
    replaced by the four gated downloads from the "Website Resources 10/26" sheet (Resources
    tab), titles verbatim and each excerpt the first sentence of its description (shortened at the
    user's request), each linking to its HubSpot landing page on learn.innerexplorer.com.
    Each cover is the landing page's hero asset on brand green
    (`src/assets/images/newsroom/resources/`); the AI library's is a capture of its HTML mockup.
    The rainbow lines in the AI library and dyslexia brief covers are repainted as the site's
    three-color accent bar (the landing pages are being changed to match). No publish dates:
    all four are 2026, in the sheet's order. The action line reads "Download free".
  - Read times are computed from the text (MTSS 6 min, Athletes 7 min); the boards say 6 and 8
    (MTSS) and 5 (Athletes).
  - Press links: as drawn; CNN, Mindful Nation UK, Fox News, Associated Press, Mindful, Fortune
    and NBC Chicago are HubSpot sales-engage tracking redirects (About's open item); Education
    Week's newsletter tracking parameters are dropped. NBC Atlanta's story differs from About's.
  - Stand-ins: the Mindful Nation UK and People logos come from the board
    (`src/assets/images/newsroom/logos/`); the resource card's PDF cover is a drawn mock. The
    MTSS hero, the athletes photo and the author photo are the real `0c8cac2` files.
  - Not built (the board draws them as placeholders or for posts that don't exist): the video,
    generic resource and press-release cards; "Bringing mindfulness to every classroom", "What
    twelve thousand classrooms taught us about morning calm", "Measuring what matters" (Keep
    reading). The Videos filter appears once a video exists. Category and tag pages (the board
    links `/blog/category/…`, `/blog/tag/…`): the breadcrumb's category and the "Filed under"
    tags are plain text.
  - Newsletter signup (Article, after Keep reading): left out until its HubSpot form exists
    (HubSpot item below).
  - Copy: the Newsroom band's "Talk to our team" and the fallback panel read "Contact us" (the
    site-wide CTA item); the canvas note's CTA hierarchy names "Book a walkthrough".
  - URLs: articles at `/newsroom/<slug>/` with "Newsroom / category" breadcrumbs (the board
    draws "Blog"); `/blog/*` 301s to `/newsroom/:splat`.
  - **Legacy posts** (12 entries from the "Blog Posts Working" boards, 2026-10-12; slugs are the
    legacy slugs in lower case; 301 rows under Launch):
    - **Dates are estimates** (no board, legacy page or HubSpot record dates them), in the legacy
      blog index's order: Daily Mindfulness Habit 2022-10-04, Anxiety 2022-08-02, Test Stress
      2022-03-15, Why Teaching 2022-01-18, Grief 2021-11-09, 3 Ways 2021-09-14, Strength
      Training 2021-07-13, Mental Health COVID-19 2021-05-04, 5 W's 2020-04-14, Immune Function
      2020-03-24, Teacher Wellbeing 2020-01-14; AI Accelerates 2026-05-12 (after the April 2026
      Education Week piece it cites). They order "Browse all stories", "Keep reading" and the
      Article JSON-LD: replace with the real dates.
    - **Promoted (2026-10-12, the user's call):** the Newsroom's top slots are set, not dated:
      `promoted: 1` MTSS (featured), `2` athletes and `3` AI Accelerates ("Also worth reading",
      where the board draws a placeholder dated May 12). "Browse all stories" leaves those three
      out (the board's grid doesn't repeat them) and lists the other articles and the research
      resources newest first (a resource by its year, so the 2023 studies lead the 2020–2022
      posts). AI Accelerates' cards read "AI Accelerates. Mindfulness Navigates" (`cardTitle`,
      the boards' name for it); its full headline ran five lines.
    - **Final check against FINAL V (2026-10-12)**, Newsroom and Article at 1440 and 390: section
      positions within 10px, except the drawn newsletter and the Videos filter (not built,
      above). Fixed: "Keep reading" cards take `cardTitle`, like the Newsroom's; the article
      resource card's phone spacing (12 between its lines, the mobile board). Left on the type
      ramp: the mobile board sets the resource title at 20 (`type-card-title-md` is 18 on a
      phone).
    - **Categories** (the boards draw none): Wellbeing, Classroom Practice, Leadership (AI).
      Tags: none.
    - **Deks** (the boards draw none; the template shows `description` under the H1 and on
      cards): the legacy meta description where it describes the post (Daily Habit, Test Stress,
      Why Teaching, Mental Health COVID-19, whose meta reads poorly: "had a bad impact"),
      otherwise the legacy blog index excerpt to its last full sentence; AI: its opening lines,
      which repeat in the body.
    - **Authors**, only what each board's author box draws: Anitra Rice (name, photo), Christy
      Cassisa (role, bio, photo), Janice Houlihan (bio, no photo; the board links "Inner
      Explorer" in it, dropped). AI: the board credits Laura Bakosh and Lisa Grady
      ("Cofounder, Inner Explorer"); the template takes one author, so Laura with her existing
      role and bio, and the closing note names both. The other 8 posts have no author.
    - **As drawn, not fixed:** typos and odd copy kept verbatim ("trait minfulness", "A little
      know fact", "Inner Explorers mindfulness platform", "time to for the classroom"); Immune
      Function's opening paragraph appears twice (board and legacy page alike). Two missing
      spaces were added (Why Teaching: "over 60%", "by 43%", "by 47%", "stressors. So").
      Straight quotes and `--` render curly and as an em dash (Astro's smart punctuation,
      site-wide).
    - **Structure:** numbered steps with a number disc (3 Ways, Immune Function, 5 W's) are H2s,
      since each board's "On this page" lists them; Immune Function's linked "5 Ways to Create
      Calm from Chaos" heading is an H2 too, so its outline has 6 items where the board lists 5.
      Quote cards are `PullQuote`s (italic between hairlines; the board draws a card with a quote
      mark). Sources are a plain list in the body (the board sets them small under a rule). The
      AI post's FAQ outline label reads "FAQ" (the template's), the board "Frequently Asked
      Questions". Bar charts left out: anxiety's "A 2021 U.S. Teacher Survey" and Why Teaching's
      "Improved grades" repeat the bullet list above each.
    - **Links rewritten:** board-internal links to the posts' new URLs; the home page, about
      and index links to `/` and `/about/`; `case-study1` to `/case-studies/kaiser-elementary/`;
      `mbsel` to `/case-studies/webb-school/` (as the 301 map sends it); `experience(.html)`
      ("experience a few of our practices", "Begin Today") to `/platform/`; the 2018 study PDF
      on the legacy host to its DOI. Kept as is (no page here yet; each needs a 301 row):
      `homeapp/index.html` (4 links, including 5 W's "family_onboarding" text),
      `good_news_november(.html)` and `good-news-february.html`. Strength Training's "Read the
      next post: Formal vs. Informal…" links to `/newsroom/` until that post exists; its
      "Daily mindfulness practice" link points at itself, as on the legacy page.
    - **Images:** the boards' photos; the AI post's hero is byte-identical to Contact's
      `student-classroom-practice.jpg`, so it uses that file (a second copy made Vite emit only
      one name and broke the share image).
    - **Not on the live site:** MTSS and athletes were on the pre-rebuild v2 site only
      (`/blog/<slug>/`, covered by `/blog/*`); AI Accelerates has no legacy URL found (not on the
      blog index, HubSpot or `/blog/…`): confirm where it was published.
- [ ] **Case Studies:** the 7 pre-rebuild YAMLs (`0c8cac2:src/content/case-studies/`) carry
      PUBLISH GATE and REVIEW comments: stand-in portraits, invented student voices,
      representative trust figures, inferred dates, La Joya's 85% vs 80%, the 43% educator-stress
      figure. Resolve each before its value reaches a new page.
- [ ] **Case Studies (index, detail template and five stories built; confirm before launch):**
  - **Launch gate, Webb approval:** a canvas note on the Webb boards says "Hold on Webb Case study:
    waiting for approval from them". Set `draft: true` on 2026-10-12 (launch prep). On approval:
    `draft: false`, point `/case-study4(.html)` and `/mbsel(.html)` in `netlify.toml` at
    `/case-studies/webb-school/`, and relink MBSEL in the "why teaching mindfulness" post.
  - **The stories (decided 2026-10-11):** Webb, Kaiser, Goddard, John Marshall and La Joya, and
    only those. Dwight Morrow and Mindful Michigan are dropped: no page, their legacy URLs go to the
    index (Launch › legacy 301 map). Related rows: where a board links a dropped story, another
    published story stands in (Webb: Goddard for Dwight Morrow; Goddard: Webb for Mindful Michigan;
    John Marshall: Kaiser and La Joya for both). The four new stories came in one PR (the user's
    call), all built from the same boards and template as Webb.
  - **Launch gate, generated-looking hero photos:** Hero D's photos for Kaiser, John Marshall and
    La Joya (`src/assets/images/case-studies/<slug>/classroom-practice.jpg`,
    `wellness-advisory-circle.jpg`) read as generated imagery, not photos of these schools, and
    the pre-rebuild entries record AI-generated brand imagery (Higgsfield / GPT Image 2) for all
    three. On a real, named school's page that is a fabrication risk (the old Kaiser page carried
    "Photos are representative and do not depict Henry J. Kaiser Elementary students."). Replace
    them with real photos (the index cards' and body photos are the legacy site's), or add a
    representative-imagery note, before launch. Goddard's hero is the real school sign.
  - **The pre-rebuild YAMLs' PUBLISH GATE and REVIEW comments**
    (`0c8cac2:src/content/case-studies/<slug>.yaml`), one by one. The new entries take their text
    from the boards only, so most of the old gates don't reach a page:
    - Resolved (nothing on the page): the stand-in portraits for Trudy Humphreys, Amber Hardman,
      Elena Kelly, Mark Roeder, Judith Lopez Guerra and Angelika Loraine Garza (voices render with
      initials discs, no faces); the invented student voices (Kaiser, Goddard); the "4.8 / 5"
      trust figures (Kaiser, Goddard); the inferred start years and phase dates (Goddard 2016,
      John Marshall 2017, La Joya's stage labels); Kaiser's "Photos are representative" gallery
      note (no gallery, but see the photo gate above); the "Anne E. Casey" spelling (the boards
      say Annie). John Marshall's six student voices are real legacy quotes and stay, set as a
      lead-in checklist ("Mindfulness", "Human Connection"…), unattributed as the boards draw them.
    - Still open, as the boards draw them:
      - **La Joya 85% vs 80%:** the PDF prints 85% on page 1 and 80% in the page-2 sidebar; the
        boards (H1, result, card, index) use 85%. Confirm the figure.
      - **La Joya's 43%:** "teachers who practice mindfulness report improved well-being and 43%
        less stress" (a result tile and a checklist line) names no study. Cite it or cut it.
      - **La Joya governance note:** the district is under TEA intervention; keep every claim at
        classroom and named-educator level. The H1 ("La Joya ISD's special education classrooms
        cut…") and the body pass; the hero names the district, not its leadership.
      - **Kaiser's language rules (2026-06-09):** never claim causation, never "tackles". The
        board's H1 ("How Henry J. Kaiser Elementary cut discipline events 77% with ten minutes of
        daily mindfulness") and results state the change as the school's, which the old rules
        avoided; the legacy title "…Tackles the Opioid Crisis…" stays off the page. Confirm.
      - **Kaiser's math figure:** the PDF's chart reads 36% for 2020, its Before/After list 38%.
        The boards use 38% and the "375% increase" result (8 → 38); the old entry used 36% and
        avoided 375%. Confirm.
      - **John Marshall's "Did You Know?" callout** (COVID-19 relief funding for MBSEL): the old
        entry dropped it because ESSER funds expired in 2024. The board keeps it; it is on the
        page. Cut it?
      - **John Marshall's "CASEL-approved":** "Inner Explorer is a CASEL-approved … program" is
        legacy wording; the old entry noted the current designation is "Designated SEL-Supportive
        Program" (pg.casel.org, checked 2026-06-09). Verbatim on the page; update?
      - **Goddard's "Colorado State Department of Education"** (the callout): the agency is the
        Colorado Department of Education. Verbatim on the page; fix?
      - **Goddard's quote attribution:** the hero and the second quote are an unnamed "School
        Counselor"; the first quote is Jenica Loether, School Counselor. They may be the same
        person (the old entry said not to merge them without confirmation).
  - **The four new stories, as drawn** (hero from `CS-Hero-D` / `-Mobile`; lead, "At a glance" and
    body from each story's Desktop and Mobile boards, which match; card from the index board):
    - **Every figure and quote** as the boards draw them. Kaiser: 77%, 190%, 375%, the discipline
      table (65 → 14, 14 → 4, 3 → 1, 82 → 19), 17% → 48% reading, 115 more students, $11,500 and
      $11,100 a year, Humphreys, Hardman, Archer and Majetich, the LG Electronics grant. Goddard:
      3X / 5X / 8X and the 2016–2018 table (Goddard vs Colorado by grade), Loether and the
      counselor, LG Electronics USA. John Marshall: 91%, 15%, 19%, 1,100 LAUSD schools, 213
      studies / 270,000 students / 11 percentile points, 5.5 million teens, Kelly, Roeder and Lisa
      Grady. La Joya: 85%, 43%, Salgado, Garza, Lopez Guerra, Dr. Laura Bakosh.
    - **Hero vs detail boards:** each H1 is Hero D's, not the legacy title (Kaiser "…cut discipline
      events 77%…", Goddard "…gained state recognition in academics through daily mindfulness
      practice", John Marshall "…turned a daily mindfulness practice into a teen mental health
      movement", La Joya "…cut reported behavior issues 85%…"); the Article headline follows. The
      read times (7, 7, 7, 6 min) are stored as drawn. Hero D's John Marshall lead says
      "longterm"; the page says "long-term" as the detail boards do.
    - **Quotes the hero repeats** were dropped from the body, as on Webb. Kaiser's, Goddard's and
      John Marshall's heroes show an excerpt, so the body loses their fuller text: Humphreys's
      "I wanted to quit. In my 31 years of teaching…", the counselor's "Mindfulness skills are
      easy to learn… like deep breathing.", Roeder's "They say things like 'Hey, you should try a
      moment of mindfulness'… Without them, these types of interactions wouldn't be happening."
      Restore any of them?
    - **Body photos** (the legacy site's, captions verbatim): John Marshall three
      (`circle-on-grass`, `advisory-member-steps`, `two-students-practice`), La Joya two
      (`students-at-desks`, `teacher-practices`). Card photos (the index board's, unlike the hero):
      Kaiser `educators-vocabulary-board`, John Marshall `students-outside`, La Joya
      `teacher-with-tablet`; Goddard's card and hero share `entrance-sign`.
    - **PDFs** restored from `0c8cac2:public/downloads/` (Kaiser 3 pages, Goddard 3, John Marshall
      2, La Joya 2). Board vs PDF: the boards carry the PDFs' text (Kaiser and Goddard checked
      line by line; John Marshall and La Joya are image-only PDFs, read by eye for La Joya); La
      Joya's PDF says "@HOME app", the board "HOME app".
    - **Template-written:** the SEO titles and descriptions (Kaiser and La Joya use a board
      sentence; Goddard and John Marshall restate the headline result), `location` for the
      JSON-LD, the Goddard table's "Grade" header and row labels, the related stand-ins, and
      Goddard's heading anchors (swapped on the board; each id now matches its heading).
    - **New template pieces, no new components** (the user's call): body blocks `table`
      (Kaiser's two tables; Goddard's paired bar chart as a table, its Goddard column in Emerald),
      `figure` (captioned photos), `callout` (Goddard's "State recognition", John Marshall's "Did
      You Know?", La Joya's two "Bonus" panels) and `stats` (`StatStrip variant="tiles"`, John
      Marshall's 15% / 19%); paragraphs take `*bold*` and `[links](…)` (Kaiser's Nation article);
      checklist items take a bold lead-in; `card.image` for an index photo unlike the hero.
    - **Drift after the side-by-side review (2026-10-11):** as Webb's below, plus Goddard's chart
      drawn as a table (no bars or legend); result-tile numerals 44 at 1440 (board 40, the one stat
      ramp); the body blocks keep the template's gaps (16–24px under a heading, 24–32px between
      blocks), where the boards set 32px above every figure, table and callout. Contrast over the
      new hero photos, measured per text line at 360–1920 (the lightest 2% behind each line): every
      line clears 4.5:1 except quote lines at 24px and up, which clear 3:1 (lowest: La Joya's
      quote at 1280, 4.3:1).
  - Hero: **Hero D · Voice led, chosen 2026-10-11** (CS-Hero-D, CS-Hero-D-Mobile), with Hero D's
    own Webb copy, which differs from the Webb detail boards; confirm each:
    - **Hartford vs Avon:** the hero's details say "Hartford, Connecticut"; the "At a glance"
      rail (from the detail board) says "Avon, Connecticut". Both show on the page. Pick one.
    - The H1 "How The Webb School in the Valley cut restraints and seclusions 65% with daily
      mindfulness practice" (the old one, "Transforming Student Behavioral Challenges…", is the
      legacy title; the Article headline and the index's ItemList JSON-LD now follow the new H1).
    - The second result "40+ to 1" (outbursts for one student, from DeVane's quote) and "6 min
      read" (stored as drawn, not computed).
    - DeVane's quote is the PDF's fuller version (with "ONE restraint and seclusion") and now opens
      the page; the body's copy of it was removed (the user's call). The Judge's quote stays.
    - The photo is 1200 × 600, upscaled to fill the 1440 × 640 band: a larger original would be
      sharper.
    - Not built: Heroes A, B, C and E.
  - PDF gate (decided: HubSpot): create the HubSpot form "Case study PDF request" with one field,
    email, label "Work email", placeholder "you@district.org", submit "Send me the PDF" (the
    boards' copy); optionally a follow-up email with the file. Put its GUID in
    `src/lib/site.ts` › `HUBSPOT.caseStudyPdfFormId`. Until then each PDF card links the file
    directly ("Download the PDF"; not the boards' copy). Then verify the form live: the inline
    layout (`[data-hsform='inline']`) is unverified, HubSpot's submit is its primary button (the
    board draws secondary), and the confirmation copy ("Thanks. Your case study is ready.") is not
    on the boards. The gate is soft: the file stays at a public URL.
  - Webb stand-ins and facts, as drawn: the photo (`src/assets/images/case-studies/webb-school/`,
    the board's legacy-site image, three students at an electronics project) and the PDF
    (`public/downloads/webb-school-case-study.pdf`, restored from `0c8cac2`, 5 pages). The 65%
    decrease; the chart values (116 / 180 / 63 / 63 / 68, "approximate values read from the original
    chart"; the old YAML said 180 → 62); partners "Aetna Foundation and LG Electronics"; Judge Frank
    Szymanski's quote and court. The template-written fields: the card label, the "At a glance"
    facts, the alt text.
  - Board vs PDF: the detail boards' copy of DeVane's quote dropped the PDF's "ONE restraint"
    sentence (Hero D restores it, above). The PDF's footnotes 1 and 2 (the dropout and suspension
    statistics) are still missing from the page; restore them?
  - Breadcrumb: the boards link "Therapeutic school" to `/case-studies/?level=therapeutic` with
    `aria-current`; no level filter exists (the chips filter by outcome), so it is plain text.
  - SEO: Webb's title is the old entry's ("Mindfulness Case Study: 65% Fewer Restraints &
    Seclusions") plus the site suffix (75 characters); the description is the board's sentence
    "After using Inner Explorer, … reported a 65% decrease in restraints and seclusion." The
    JSON-LD ports `0c8cac2`'s Article + BreadcrumbList (no `citation`: the boards cite no sources)
    and CollectionPage + ItemList.
  - Copy verbatim: "Talk to our team" (index hero, rail, detail CTA) and "Contact us" (index CTA),
    per the site-wide CTA item. Index hero copy supplied 2026-10-12: "Real Results from Real Schools".
  - Drift left after the measured side-by-side reviews (2026-10-10 and, for Hero D, 2026-10-11;
    index hero within 3px at both widths; the Hero D hero within 6px of its board at 1440; the
    body within 20px by the PDF card): headings sit 4px higher each (52 → 48 margins); numerals 48
    → 44; body quotes 18 on mobile (board 20, per the quote decision); chart labels 13 on mobile
    (board 12) and bars 60% of their column (board fixed widths); the closing CTA title wraps
    after "be" (the shared inline block). Card gap 24 as the index board sets it (the card-system
    board says 8). Hero D: result numerals 44 → 40 on the one stat ramp (board 32); the mobile H1
    32 (board 30); the hero quote 18 below xl (board 21) and 1.4 leading at xl (board 1.36); the
    breadcrumb at .06em (board .08, so it holds one line on mobile where the board wraps); Forest
    scrims (board Deep Forest), the bottom one darker than drawn. Below xl the hero uses the mobile
    layout (quote at the foot, card rising 64px): at lg the 640px quote outran the left scrim and
    white fell under 3:1. Measured per text line over the photo, every 14–16px line clears 4.5:1
    at 360–1920. The weakest quote lines at 1280–1366 are 3.4–4.5:1, which passes because the
    quote is large text (≥ 24px) there.

## Build order

- [x] Design-foundation PR (`rebuild-plan.md` › The design-foundation PR).
- [x] Contact, with the success state; style the HubSpot form (`ie-field`, `ie-label`).
- [x] Home: `blocks/PhotoHero`, `StatStrip`, `LogoStrip`, `ui/VideoPoster`; the white
      `ClosingCta` with photo; Testimonial emphasis.
- [x] Platform: `blocks/EvidenceCard` (shared with Research), segmented tabs and sample players
      (page-only), `--shadow-lifted`; board assets as stand-ins (Before build › Platform).
- [x] Why Inner Explorer: `StatStrip variant="ruled"`, Checklist lead-ins and `strong`, the
      half-bleed panel (`--bleed`, `.ie-bleed-start` / `-end`), `.ie-minus-disc`, subject and
      funding feature icons; board assets as stand-ins (Before build › Why). ROI estimator parked.
- [x] Case Studies: the collection, the index, the detail template and Webb School;
      `PageTitle layout="split"`, `blocks/StoryCard`, `blocks/BarChart`, Testimonial `initials`,
      the HubSpot PDF gate with a direct-link fallback; the `transfer-case-study` skill rewritten
      (Before build › Case Studies).
- [x] Case Studies: Kaiser, Goddard, John Marshall and La Joya in one PR, PDFs from
      `0c8cac2:public/downloads/`; the body's `table`, `figure`, `callout` and `stats` blocks,
      `StatStrip variant="tiles"`, `card.image` (Before build › Case Studies). Dwight Morrow and
      Mindful Michigan dropped (2026-10-11).
- [x] Newsroom and Article: the `news` collection (MDX, with `authors`), `/newsroom/` and the
      article template at `/newsroom/<slug>/` (Article, FAQPage and BreadcrumbList JSON-LD),
      the 2 real posts from `0c8cac2:src/content/blog/`; `blocks/MediaCard`, `blocks/StatTile`
      (Research's tiles moved onto it), `PageTitle splitLead="narrow"` and `barWidth="article"`,
      PageLayout's `top` slot, `Button iconStart`, `.ie-prose`, `.ie-faq`; `/newsroom/`
      breadcrumbs, `/blog/*` 301s (Before build › Newsroom and Article).
- [x] Newsroom: the legacy posts word for word ("Blog Posts Working" page) as `news` entries:
      14 asked for, 12 new (MTSS and athletes were already built and stay as built). `author`
      optional (byline and author box drop out; JSON-LD credits Inner Explorer), body images
      through `.ie-prose img` (Before build › Newsroom and Article › Legacy posts).
- [ ] Newsroom: the board's 7 other legacy posts, not built (asked for 14 of them, 2026-10-12):
      Formal vs. Informal Mindfulness Practice, Mindfulness Based Social and Emotional Learning
      (MBSEL), What is Mindfulness-Based Social Emotional Learning (MBSEL)?, How Mindfulness Works
      to Reduce Teacher Stress and Burnout, The Inner Explorer Tune In Feature For Families,
      Mindfulness and Diversity, and the federal COVID relief funds FAQ. Their legacy URLs need a
      row in the 301 map either way.
- [x] Research: the brain diagram and dose waffles (inline SVG), the wall, Show our work,
      `LogoStrip layout="marquee"`, EvidenceCard extra tags and details slot, `PageLayout
header="dark"`; title sizes snapped per the Remaining-drift board (Before build › Research).
- [x] Pricing: plan cards, the comparison table (built from the FINAL V boards, not the design
      system's `PricingTable`), the Advanced Wellness panel, `ClosingCta layout="inline"`; data
      from `0c8cac2:src/content/pages/pricing.yml`, board wins; the 48px title snapped to 44.
- [x] About: `LogoStrip layout="wall"` (partners and press), Emerald panels, the facts card
      over the hero photo; board assets as stand-ins (Before build › About).

## Launch

- [ ] Point www.innerexplorer.com at the marketing Netlify site (the legacy site serves it today).
- [x] Legacy 301 map in `netlify.toml` (2026-10-12): the tables below, the PDFs to the same
      file, `/homeapp/privacy-policy.html` → `/privacy-policy/`, `/homeapp/*` → the Help Center's
      family page, `/term` → `/terms/`, the legacy About/Program/District/Research pages, and
      `/compass/*` (the district portal and sign-up links) 302 → app.innerexplorer.com, as the
      legacy server did. Built from the legacy sitemap and links, each path with and without
      `.html`. **Still open:** the lms.innerexplorer.org copies are served by the legacy Apache
      host, so their 301s are set there (context per story: "Open follow-ups" in
      `tasks/seo-playbook.md`).
      Case studies (slugs as built, 2026-10-11):

      | Legacy URL                                         | New URL                                           |
      | -------------------------------------------------- | ------------------------------------------------- |
      | `/case-study1`                                     | `/case-studies/kaiser-elementary/`                |
      | `/images/HJK-Elementary.pdf`                       | `/downloads/kaiser-elementary-case-study.pdf`     |
      | `/case-study2` (Dwight Morrow, dropped)            | `/case-studies/`                                  |
      | its PDF (path unknown; find it in the crawl)       | `/case-studies/`                                  |
      | `/case-study3`                                     | `/case-studies/goddard-middle-school/`            |
      | its PDF (likely `/images/Goddard-MS.pdf`; confirm) | `/downloads/goddard-middle-school-case-study.pdf` |
      | `/case-study4`                                     | `/case-studies/webb-school/`                      |
      | `/images/Webb-School.pdf`                          | `/downloads/webb-school-case-study.pdf`           |
      | `/mbsel.html`                                      | `/case-studies/webb-school/`                      |
      | `/case-study5`                                     | `/case-studies/john-marshall-hs/`                 |
      | `/images/John-Marshall-HS.pdf`                     | `/downloads/john-marshall-hs-case-study.pdf`      |
      | `/case-study6`                                     | `/case-studies/la-joya-isd/`                      |
      | `/images/La-Joya-ISD.pdf`                          | `/downloads/la-joya-isd-case-study.pdf`           |
      | `/case-study7` (Mindful Michigan, dropped)         | `/case-studies/`                                  |
      | `/images/Mindful-Michigan-Model.pdf`               | `/case-studies/`                                  |

      Each PDF could instead go to its story page (the playbook's plan, which sends ranking PDF
      traffic to the HTML story); pick one rule for all five.

      Blog (legacy posts as built, 2026-10-12). The legacy paths keep their capitals, and
      `/blog/*` → `/newsroom/:splat` would carry them into a 404 (the new slugs are lower case),
      so each needs its own rule, placed above the splat:

      | Legacy URL                                                                | New URL                                                                     |
      | ------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
      | `/blog-index`                                                             | `/newsroom/`                                                                |
      | `/blog/Daily-Mindfulness-Habit`                                           | `/newsroom/daily-mindfulness-habit/`                                        |
      | `/blog/anxiety-in-the-classroom`                                          | `/newsroom/anxiety-in-the-classroom/`                                       |
      | `/blog/Mindfulness-in-The-Classroom-Helps-Students-Stay-on-Their-A-Game`  | `/newsroom/mindfulness-in-the-classroom-helps-students-stay-on-their-a-game/` |
      | `/blog/why-teaching-mindfulness-in-the-classroom-is-good-for-mental-health` | `/newsroom/why-teaching-mindfulness-in-the-classroom-is-good-for-mental-health/` |
      | `/blog/mindfulness-and-grief`                                             | `/newsroom/mindfulness-and-grief/`                                          |
      | `/blog/3-Ways-to-Create-Calm-from-Chaos-with-Daily-Mindfulness`           | `/newsroom/3-ways-to-create-calm-from-chaos-with-daily-mindfulness/`        |
      | `/blog/Daily-Mindfulness-Practice-Strength-Training-for-the-Brain`        | `/newsroom/daily-mindfulness-practice-strength-training-for-the-brain/`     |
      | `/blog/Mental-Health-Helps-Children-During-COVID-19-Beyond`               | `/newsroom/mental-health-helps-children-during-covid-19-beyond/`            |
      | `/blog/The-5-Ways-Of-Mindfulness`                                         | `/newsroom/the-5-ways-of-mindfulness/`                                      |
      | `/blog/Mindfulness-Improves-Immune-Function-And-Decreases-Stress`         | `/newsroom/mindfulness-improves-immune-function-and-decreases-stress/`      |
      | `/blog/Time-We-Outsmart-Stress-And-Take-Stand-For-Teacher-Wellbeing`      | `/newsroom/time-we-outsmart-stress-and-take-stand-for-teacher-wellbeing/`   |
      | `/blog/inner-explorer-mtss-tiers/` (pre-rebuild v2 site only)             | `/newsroom/inner-explorer-mtss-tiers/` (the `/blog/*` splat already does it) |
      | `/blog/mindfulness-for-student-athletes/` (pre-rebuild v2 site only)      | `/newsroom/mindfulness-for-student-athletes/` (the splat already does it)   |
      | AI Accelerates (no legacy URL found)                                      | `/newsroom/ai-accelerates-mindfulness-navigates/`                           |
      | the 7 posts not built (`/blog/Formal-vs-Informal-Mindfulness-Practice`, `/blog/Mindfulness-To-Reduce-Stress-And-Burnout`, `/blog/What-is-Mindfulness-Based-Social-Emotional-Learning`, `/blog/mindfulness-and-diversity`, `/goodnews`, `/Mindfulness-Based-Social-and-Emotional-Learning.html`, `/Frequently-Asked-Questions-About-Federal-COVID-Relief-Education-Funds.html`) | `/newsroom/` until built |
      | `/homeapp/index.html`, `/good_news_november(.html)`, `/good-news-february.html` (linked from the posts) | to decide |

      Also: `/compare_program` → `/pricing/`. Then crawl the legacy site for anything else that
      ranks or is linked.

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
- [x] HubSpot contact form: the confirmation no longer promises an email (2026-10-12). If a
      follow-up email is added on the form, restore "We just sent a confirmation to your inbox".
- [x] HubSpot tracking code on both sites, production builds only, skipped on \*.netlify.app
      (`components/integrations/HubSpotTracking.astro`, 2026-10-12; reverses the pre-rebuild call).
- [ ] HubSpot settings: turn on the cookie consent banner if wanted (Settings › Privacy &
      Consent; the tracking script renders it); keep HubSpot chat OFF (Intercom is the messenger).
- [ ] Privacy policy (counsel): it says Amplitude handles educator usage data only, but Amplitude
      Session Replay records every marketing-site visitor. Update the policy or the sample rate.
- [ ] Intercom: add the `*.netlify.app` guard to `Intercom.astro` once www is live (its comment
      explains why it has none pre-launch).
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
      reworded: legal copy moves verbatim. The legacy Terms and Conditions moved verbatim to
      `/terms/` (2026-10-12, `src/content/legal/terms.mdx`); counsel to review (it names a
      Massachusetts jurisdiction and a mobile app, and lists tech@ as contact).
