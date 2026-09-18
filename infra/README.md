# Phase 1 — static demo hosting on a Linux VPS

This directory holds everything needed to serve `../site/` from a single
VPS. Nothing here is provisioned yet — see "Provisioning checklist" below.

## Files

| File | Purpose |
|---|---|
| `Caddyfile` | Caddy config: serves `/srv/credits-gg` with automatic Let's Encrypt TLS |
| `setup.sh` | One-shot bootstrap for a fresh Ubuntu 24.04 LTS box (run as root) |
| `../.github/workflows/deploy.yml` | GitHub Actions: rsync `site/` to the VPS on every push to `main` |

## Provisioning checklist

1. **Decide provider + domain** (open — see `docs/HOSTING-PLAN.md` §4).
   `credits.gg` itself is taken (parked lander as of 2026-09-17).
2. Create the cloud account (Hetzner Cloud or OVHcloud) and note the API
   token — it goes into the Secure Vault, never into the repo.
3. Create the server: Ubuntu 24.04, smallest instance (Hetzner CX22 ~€4/mo
   or OVHcloud VPS equivalent), add your SSH public key at creation time.
4. Point DNS: `A` record for the chosen domain → server IPv4
   (and `AAAA` → IPv6 if provided).
5. SSH in as root, copy this repo's `infra/` over (or clone the repo), then:
   ```sh
   DOMAIN=demo.example.com DEPLOY_PUBKEY="$(cat ~/.ssh/id_ed25519.pub)" bash setup.sh
   ```
   The script creates the `deploy` user, hardens SSH/ufw, installs Caddy,
   writes the Caddyfile with your domain, and enables automatic security
   updates.
6. Add GitHub Actions secrets on the repo:
   `DEPLOY_SSH_KEY` (private key matching DEPLOY_PUBKEY),
   `DEPLOY_SSH_HOST` (domain or IP), `DEPLOY_SSH_USER` (`deploy`).
7. Push to `main` — the workflow syncs `site/` to `/srv/credits-gg/`.

## Notes

- Caddy obtains the TLS certificate automatically once DNS points at the box.
  Until then the workflow still deploys; the site just won't be reachable by
  name.
- No build step: `site/` is deployed as-is. Rollback = `git revert` + push.
