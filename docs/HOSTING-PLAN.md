# credits.gg — Linux Hosting Plan

> Companion to `V1-DECISIONS.md`. This is a **plan**, not an implementation —
> nothing below is provisioned yet. Decisions marked **[DECIDE]** need
> Sepand's call before build-out.

## 0. Constraints & preferences

- **No Amazon / most US companies** (standing boycott; Best Buy Canada is the
  retail exception, not relevant here). Prefer **Canadian or non-US** hosting.
  Candidates: **Hetzner** (Germany), **OVHcloud** (Canada/France).
- Start cheap and boring: a single Linux VPS is plenty for V1 demo hosting and
  the first production iteration.
- The current demo (`credits-gg-2`) is a **static site** — trivially hostable
  as Phase 1. The full production version (accounts, moderation, search
  backend) comes later as Phase 2.

## 1. Phase 1 — Static demo hosting (now)

**Goal:** serve the V1 demo at a stable URL under our control.

- **Server:** one VPS (e.g. Hetzner CX22/CX32 or OVHcloud VPS), Ubuntu LTS.
- **Web server:** **Caddy** (automatic Let's Encrypt TLS, single config file)
  or nginx + certbot. Caddy preferred for simplicity.
- **Deploy:** GitHub Actions on push to `main`:
  1. Build/export the static site artifact.
  2. `rsync` over SSH to `/srv/credits-gg/` on the instance.
- **DNS:** A/AAAA record (e.g. `demo.credits.gg`) → instance IP. **[DECIDE]**
  domain name.
- **Hardening:** non-root deploy user, SSH key only, `ufw` allowing 22/80/443,
  automatic security updates (`unattended-upgrades`).
- **Cost:** roughly €4–6/mo (Hetzner) — verify at provisioning time.

## 2. Phase 2 — Production application (later)

**Goal:** real backend — database, search, auth, moderation, media pipeline.

### 2a. Architecture (proposed, [DECIDE] stack)

- **App:** containerized web app (whatever stack V1 production picks —
  Next.js/Node was discussed but not decided) behind Caddy as reverse proxy.
- **Database:** PostgreSQL 16+ in Docker, data on a persistent volume.
  Full-text search via `tsvector`/`pg_trgm` first; Meilisearch as a later
  dedicated container if needed.
- **Assets:** studio logos, franchise art, backgrounds served from
  `/srv/credits-gg/assets/` (or object storage later), matching the folder
  structure in the V1 production blueprint.
- **Backups:** nightly `pg_dump` + asset sync to off-site storage; test
  restores quarterly.
- **Orchestration:** Docker Compose with restart policies; systemd unit for
  boot ordering. No Kubernetes — overkill for this stage.

### 2b. CI/CD

- GitHub Actions: lint → test → build image → push to registry
  (GitHub Container Registry) → SSH deploy hook pulls and restarts Compose
  stack on the instance.
- Separate `staging` compose project on the same box for pre-merge previews
  (optional, cheap).

### 2c. Data concerns from V1

- The **provenance manifest** (logo/artwork sources, AI-derivative flags)
  ships with the app and must be part of backups.
- Seed data: the God of War research JSON + fictional samples migrate into
  Postgres via a checked-in seed script — no hand-editing production rows.

## 3. Repo layout (this repository)

```
credits-gg/
├── docs/
│   ├── V1-DECISIONS.md      # frozen V1 record (this phase)
│   └── HOSTING-PLAN.md      # this file
├── research/                # franchise research JSON, notes
├── infra/                   # Phase 1+: Caddyfile, deploy workflow, ufw rules
└── README.md                # what this repo is, where the demo lives
```

`infra/` starts nearly empty (Caddyfile + deploy workflow land with Phase 1).

## 4. Open decisions for Sepand

1. **Domain** (`credits.gg` availability? registrar?).
2. **Provider:** Hetzner (DE) vs OVHcloud (CA) — both fit the non-US
   preference; Hetzner is cheaper, OVHcloud has Canadian datacenters.
3. **Production stack** (the Next.js/Postgres sketch was never confirmed).
4. Whether Phase 1 should keep the `muse.ai` public link, move to the custom
   domain, or both.

## 5. Suggested sequencing

1. ✅ Freeze V1 decisions (`V1-DECISIONS.md`).
2. Create this repo; push docs.
3. **[DECIDE]** provider + domain → provision VPS → Caddy → deploy static
   demo via GitHub Actions.
4. Confirm production stack → Phase 2 containers + Postgres + backups.
