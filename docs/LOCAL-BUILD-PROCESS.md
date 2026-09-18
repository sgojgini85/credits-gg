# Local-build compatibility process

> Decision 2026-09-17: iteration continues in the hosted artifact builder, but
> **every change must be describable as portable static files** so the app can
> be materialized into this repo and built locally on an ad-hoc basis, then
> deployed to a Linux host later.

## Rules for every future change

1. **No artifact-runtime-only tricks.** Everything must be expressible as
   static HTML + CSS + JS. No server-side features, no hosted-runtime APIs.
2. **Data lives in JSON.** Franchise/game/studio/contributor data must be
   representable as JSON files under `site/data/` (one file per domain or per
   franchise). No data hard-coded only inside builder internals.
3. **Assets live in folders.** Logos, key art, background artwork go under
   `site/assets/{logos,art}/` with the naming convention from the V1
   production blueprint. Every asset is recorded in `site/assets/provenance.json`
   (source URL or "AI-adapted", with the AI flag). AI-adapted logos keep the
   orange corner badge in the UI.
4. **Styles are theme-portable.** The dark graphite-and-amber theme is defined
   as CSS custom properties (palette in V1-DECISIONS.md §2). Per-franchise
   theming = a theme class + background artwork reference, never inline
   one-off styles that can't be replayed.
5. **Every change gets a BUILD-LOG entry.** Each `artifact.edit` is recorded in
   `docs/BUILD-LOG.md` the same day, written as a **replayable spec**: what
   changed, the exact behavior, and the data/files it touches — detailed
   enough that someone (or a future agent) can reimplement it locally without
   seeing the artifact.

## Ad-hoc local materialization

When Sepand asks for a local build:

1. Reconstruct `site/` from `V1-DECISIONS.md` + `BUILD-LOG.md` specs
   (there is no file export from the artifact runtime — materialization is a
   faithful rebuild from the specs, which is why the specs must stay precise).
2. Verify locally: `python3 -m http.server` in `site/` and click through the
   changed flows.
3. Commit `site/` to the repo. Deployment then follows `HOSTING-PLAN.md`
   Phase 1 (rsync via GitHub Actions).

## Target `site/` layout

```
site/
├── index.html
├── css/
├── js/
├── data/            # franchises.json, studios.json, contributors.json, ...
└── assets/
    ├── logos/
    ├── art/         # franchise background artwork, key art
    └── provenance.json
```
