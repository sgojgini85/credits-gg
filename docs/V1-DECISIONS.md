# credits.gg — V1 Decisions & Design Record

> Status: **V1** — snapshot of every product, design, and data decision made
> during the prototype/demo phase (up to 2026-09-17).
> Living demo: `credits-gg-2` (static) · Public: https://muse.ai/s/credits-gg-2-xhxw63yrxgxdv81
> Companion doc: `HOSTING-PLAN.md` (how V1 gets hosted on a Linux instance).

## 1. Product vision

- **IMDb for video games**: expose behind-the-scenes information — who made the
  game (developers, artists), and with what (tech stack).
- **Search is the flagship feature.** Detailed search UX is deferred to a later
  design pass; current demo search is functional but not final.
- A person's multi-year tenure at a studio (across roles and games) is a
  first-class concept, potentially sourced from LinkedIn employment history.

## 2. Visual design language (V1)

- **Dark graphite-and-amber theme.** Near-black backgrounds (`~#121218`),
  amber/gold accents and pills, white headlines, light-gray body text, teal
  used sparingly for stat numbers/years. Verified live on the public link.
- **Per-franchise theming.** Each franchise page gets custom background artwork
  and accent treatment tied to the series (e.g. God of War: Kratos and Atreus
  in a misty Norse mountain/river landscape behind the title).
- **Grid density cap.** Franchise timeline sections show at most **4 columns**
  of cards (was 6 — too crowded). Cards must still look good when clicked/
  expanded.

## 3. Franchises

- A franchise entity spans **games, releases, generations, publishers, studios**.
- Franchise timelines **expose studio changes** across the series' history.
- Franchise pages highlight standout contributors: **most games, longest
  franchise span, role progression across releases**. Role progression needs a
  reusable **discipline-specific seniority taxonomy** (not yet built).
- **Real demo franchises:** God of War, The Witcher, GTA. Fictional padding
  games/people are allowed only when **clearly labeled FICTIONAL**.

### 3a. Release tracking policy (decided 2026-09-17)

- Track **remasters, ports, collections, patches, and new-platform releases**
  within the franchise — they are part of its history.
- Remasters appear as **secondary entries tied to the original game**, not as
  unrelated new games.
- Include **officially announced unreleased games even without a concrete
  release date**. They get dashed timeline styling, sparse verified metadata,
  and a deliberately limited page experience.
- **Never present rumours as confirmed releases.** (The rumoured "Laufey"
  project is not modeled as a real game.)

### 3b. God of War reference data (verified 2026-09-17)

22 tracked entries built from 16 researched titles
(`god-of-war-franchise-research.json`):

- **God of War Collection** — PS3, 2009. Remaster work by **Bluepoint Games**;
  later PS Vita port by **Sanzaru Games**. (Not PS4 — corrected 2026-09-17.)
- **God of War III Remastered** — PS4, 2015. Playable on PS5 via backward
  compatibility; not a native PS5 remaster.
- **God of War (2018)** — Windows release **2022-01-14**, port by
  **Jetpack Interactive**, supervised by Santa Monica Studio. PS5 got an
  enhanced-performance patch for the PS4 app, not a remaster.
- **God of War Ragnarök** — PS4/PS5 **2022-11-09**; Windows **2024-09-19**
  (Jetpack Interactive helped deliver the PC port).
- **Untitled original Greek trilogy remake** — officially announced on
  PlayStation Blog **2026-02-12**; early development, no release window.
  Included as announced/unreleased.
- Not fully verified (omit or mark unverified): remaster studio for
  *God of War III Remastered*, some *Betrayal* leads, *Origins Collection*
  port-studio attribution, *Ragnarök: Valhalla* details.

## 4. Games

- **Platform pills are the main control.** Each platform release can have its
  own date and contributor group. Hovering a pill shows the release date and
  relevant port studio. Default credits span **all releases**; selecting pills
  filters to the **union** of contributors for those platforms.
- Release-specific labels are allowed (e.g. "PC only").
- **Studio logos on game cards.** Each card shows the logo of the studio(s)
  that worked on that game so studios are distinguishable at a glance.
  Logos are **dark/monochrome AI-adapted versions** that blend with the theme;
  every AI-adapted logo carries a small **AI corner badge**. A machine-readable
  **provenance manifest** records the source of each logo/artwork and flags
  AI derivatives.
- Contributor names are **clickable everywhere** (game pages, franchise pages,
  search results) and open a full contributor profile.

## 5. Studios

- Franchise pages have a **"Studios" roster**: every studio that has ever
  worked on the franchise (original developers, port/remaster studios, …).
- **Interaction:** clicking anywhere on a studio card **toggles** the timeline
  filter for that studio (click again to unselect). The card **expands inline**
  showing founding year and a **per-console breakdown** of tracked games
  (e.g. "PSP · 2, PS3 · 1").
- The link to the **dedicated studio page** appears **only in the expanded
  state**. Studio pages show the studio's tracked releases within the demo.

## 6. Contributors & credits

- **Game credits are authoritative for per-game roles.**
- **LinkedIn is for studio-tenure date ranges only**, never for roles.
- Credits and tenure records stay **separate** and are joined by overlapping
  dates. Non-overlap can *suggest* freelance/contracting/outsourcing but must
  not be automatically classified without evidence.
- **No LinkedIn importer exists** (deferred). IGDB/MobyGames licensing, access,
  pricing, attribution, and reuse restrictions are **unverified**.

### 6a. Role hierarchy

- Discipline groups: **Engineering, Art, Design, Audio, Production, QA**.
- Sub-disciplines supported (e.g. Audio → Music / Sound Design /
  Voice & Dialogue).
- Groups are collapsible and show counts.
- Role-title mapping needs a **correction mechanism** (not yet built).

### 6b. Tenure display rules

- **Graduated shading** for overlap density.
- Detail expands **inline, never in a blocking modal** (Sepand: "The detailed
  version of tenure doesn't need to be modal and block the rest of
  information.").
- Expanded result has **one timeline track per contributor**; one further click
  opens the game while **preserving contributor context**.
- **Contractors** count without studio tenure and use **dashed styling**.
  Unknown contractor duration is a credited **point/diamond, never an invented
  span**.

## 7. Worked Together (collaboration finder)

- Contributor **autocomplete** (not unwieldy lists); filters may include
  **studio, department, era**; **removable person chips**.
- Suggestions based on overlap with selected people; games **ranked by
  contributor overlap**; **separate exact and partial matches**; escape hatch
  when no exact intersection exists.
- Supports **people-to-games and game-to-games** modes; must scale to hundreds
  of contributors and games.
- Worked Together calculations should use **release-scoped credits** where
  available.
- **Empty-selection behavior (decided 2026-09-17):** with no contributor
  selected, suggestions show each person's **total game count** ("Ranked by
  total sample game credits") — "0 Shared" is meaningless there. Once someone
  is selected, suggestions switch to **shared-game counts and ranking**
  ("Ranked by shared sample credits").

## 8. Production data & asset blueprint

The demo ships a collapsible **production data/asset blueprint** plus a
machine-readable **provenance manifest**. For the full production version:

- **Database** models: franchises, games, releases (per-platform, each with
  date + contributor group), studios, contributors, credits (role, discipline,
  sub-discipline), tenure ranges, sources, and asset references.
- **Asset storage:** folder structure for studio logos, franchise key art, and
  per-franchise background artwork, with naming conventions, formats, and
  licensing/attribution tracking per asset.
- **Provenance:** every sourced or AI-adapted asset is recorded with origin;
  AI derivatives are visibly badged in the UI.

## 9. Deferred / unverified

- Search flagship UX design (deferred).
- Auth, moderation, media pipeline, LinkedIn importer (deferred).
- Discipline-specific seniority taxonomy for role progression (not built).
- Role-title correction mechanism (not built).
- IGDB/MobyGames licensing, access, pricing, attribution, reuse (unverified).
- Proposed-but-unconfirmed stack from early discussion: Next.js App Router,
  TypeScript, Tailwind, PostgreSQL + Prisma, `tsvector`/`pg_trgm` (possible
  later Meilisearch), Vercel + Neon/Supabase. **Not decided for production —
  see HOSTING-PLAN.md.**
