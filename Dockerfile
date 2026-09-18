# credits.gg — local development container
# Builds a Caddy image serving ./site/ on port 80.
# Same web server as the Phase 1 VPS (see infra/Caddyfile), minus TLS —
# local dev doesn't need it.

FROM caddy:2-alpine

COPY infra/docker/Caddyfile /etc/caddy/Caddyfile
COPY site/ /srv/credits-gg

EXPOSE 80
