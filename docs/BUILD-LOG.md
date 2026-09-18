# credits.gg — Build log (replayable specs)

> Every change made in the artifact builder is recorded here as a spec precise
> enough to reimplement locally (see `LOCAL-BUILD-PROCESS.md`). Newest first.

## 2026-09-17 — Worked Together empty-state suggestions

- **Request:** with no contributor selected, suggestions all read "0 Shared",
  which is useless.
- **Spec:** when selection is empty, each suggestion shows the person's
  **total associated game count** (e.g. "Jonah Reid · Design · 5 games") and
  the header reads "Ranked by total sample game credits". As soon as ≥1
  contributor is selected, suggestions revert to shared-game counts
  ("Owen Park · Engineering · 4 shared") and the header reads
  "Ranked by shared sample credits", with exact/partial match sections.

## 2026-09-17 — Studio cards: click-to-filter toggle + inline expansion

- **Request:** remove the "Filter Timeline" sub-button; clicking anywhere on
  the card filters, clicking again unselects; expanded card shows studio info;
  studio-page link only in expanded state.
- **Spec:** each studio card in the franchise "Studios" roster is a single
  toggle button (hint text: "Select a studio to filter; select it again to
  clear."). Click → (a) timeline filters to that studio's releases with a
  notice + "Clear studio filter" control, and (b) the card expands inline
  showing `ESTABLISHED: <year>` and `TRACKED GAMES BY PLATFORM: <Console> ·
  <n>, …`. Click again → card collapses, filter clears, timeline shows
  "Showing every studio in this franchise." The "Open full studio profile →"
  link renders **only** in the expanded state.

## 2026-09-17 — Contributor names link to profiles

- **Request:** wherever a contributor name appears — especially game and
  franchise pages — it must be clickable to a full profile.
- **Spec:** contributor names render as links/buttons opening a "SOURCED
  CONTRIBUTOR PROFILE" page (breadcrumb "Search / Contributor", avatar
  initials, credit-appearance count, franchise/role context, sources list,
  tracked-appearance cards linking back to games). Verified from franchise
  "People who shaped the franchise" and game "Sourced credits by department".

## 2026-09-17 — Franchise studio roster, filtering, studio pages

- **Request:** franchise page shows every studio that ever worked on it, with
  filtering and links to dedicated studio pages.
- **Spec:** "Studios across <Franchise>" section lists all studios (God of
  War: 9 — Santa Monica Studio, Ready at Dawn, Jetpack Interactive, Bluepoint
  Games, Javaground, Mega Cat Studios, Sanzaru Games, SCEA, SOE Los Angeles).
  Card interactions per the 2026-09-17 toggle spec above (this entry's
  predecessor used separate "Filter timeline" / "Studio page →" buttons —
  superseded). Studio page: breadcrumb "Studios / <Name>", AI-styled logo,
  "<n> franchise release records" summary, "Tracked releases" list with
  "Open franchise →" links.

## 2026-09-17 — Dark-theme studio logos with AI badge

- **Request:** logo backgrounds clashed with the dark page; find better-
  matching versions or generate them, badging AI-generated ones.
- **Spec:** game-card studio logos are dark/monochrome AI-adapted marks on
  dark, faintly orange-glowed tiles — no white backgrounds. Each AI-adapted
  logo carries a small orange **"AI" corner badge** (top-right). Covered
  studios: Santa Monica Studio, Ready at Dawn, Bluepoint Games, Sanzaru
  Games, Jetpack Interactive, Mega Cat Studios. Cards with text-only
  attributions (e.g. "Javaground / SOE Los Angeles") show no logo.
  `provenance.json` flags every AI derivative.

## 2026-09-17 — Franchise 4-column cap, per-franchise theming, studio logos

- **Request:** franchise sections max 4 columns (6 was crowded); style each
  franchise page for its series with custom background artwork; source studio
  logos onto game cards; document production DB/folder storage.
- **Spec:** timeline sections render ≤4 cards per row. Each franchise gets a
  hero banner with series-specific artwork (God of War: Kratos and Atreus,
  misty Norse mountain/river landscape) behind the title + eyebrow
  "FRANCHISE TIMELINE · <span>". Game cards show studio logo image(s) next
  to the studio name (multi-studio cards show both). Production blueprint
  (DB schema + asset folder structure) and machine-readable provenance
  manifest ship with the demo.

## 2026-09-17 — Dark theme enforcement

- **Request:** page still served the light cream theme; expected the dark
  theme from the prototype.
- **Spec:** root theme **forced dark** (no `prefers-color-scheme` fallback to
  light). Palette: page bg near-black `~#121218`, cards `#1a1c26`-ish with
  subtle borders, amber/gold accents and pills (`All releases` active pill =
  filled amber, dark text), white headlines, light-gray body, teal stat
  numbers/years. Verified live via hard-refresh screenshot check.

## 2026-09-17 — God of War franchise data expansion (22 entries)

- **Spec:** 16 researched titles expanded to 22 release/project entries
  (originals, collections, remasters, ports, patches, DLC, announced).
  Source: `god-of-war-franchise-research.json`. Release-tracking policy and
  verified per-release facts are in `V1-DECISIONS.md` §3a–3b.
