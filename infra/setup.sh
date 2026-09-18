#!/usr/bin/env bash
# One-shot bootstrap for a fresh Ubuntu 24.04 LTS VPS (run as root).
# Usage: DOMAIN=demo.example.com DEPLOY_PUBKEY="$(cat ~/.ssh/id_ed25519.pub)" bash setup.sh
set -euo pipefail

: "${DOMAIN:?Set DOMAIN, e.g. DOMAIN=demo.example.com}"
: "${DEPLOY_PUBKEY:?Set DEPLOY_PUBKEY to the deploy SSH public key}"

echo "==> Creating deploy user"
id deploy &>/dev/null || useradd -m -s /bin/bash deploy
mkdir -p /home/deploy/.ssh
echo "$DEPLOY_PUBKEY" > /home/deploy/.ssh/authorized_keys
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh

echo "==> Site directory"
mkdir -p /srv/credits-gg
chown -R deploy:deploy /srv/credits-gg

echo "==> Firewall (SSH/HTTP/HTTPS only)"
ufw allow 22/tcp >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable

echo "==> Automatic security updates"
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq unattended-upgrades >/dev/null
systemctl enable --now unattended-upgrades

echo "==> Installing Caddy"
apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https curl >/dev/null
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq caddy >/dev/null

echo "==> Writing Caddyfile for $DOMAIN"
sed "s|{\$DOMAIN}|$DOMAIN|" /root/infra/Caddyfile > /etc/caddy/Caddyfile
# If you cloned the repo elsewhere, copy infra/Caddyfile next to this script first.
caddy fmt --overwrite /etc/caddy/Caddyfile
systemctl enable --now caddy
systemctl reload caddy

echo "==> Done. Point DNS ($DOMAIN) at this box and Caddy will fetch TLS automatically."
