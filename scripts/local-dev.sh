#!/usr/bin/env bash
# credits.gg local dev: ensure Docker exists, build the container, run it.
# Usage: bash scripts/local-dev.sh   (from anywhere; finds the repo root)
# Serves the demo at http://localhost:8080
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

ensure_docker() {
  if command -v docker >/dev/null 2>&1; then
    return 0
  fi
  echo "Docker not found — attempting install..."
  if [[ "${OSTYPE:-}" == darwin* ]]; then
    echo "macOS detected: install Docker Desktop from"
    echo "  https://www.docker.com/products/docker-desktop/"
    echo "then re-run this script."
    exit 1
  elif [ -f /etc/debian_version ]; then
    sudo apt-get update -qq
    sudo apt-get install -y -qq docker.io
    sudo systemctl enable --now docker 2>/dev/null || sudo service docker start 2>/dev/null || true
    echo "Docker installed. If you hit permission errors, log out/in (docker group) or re-run with sudo."
  else
    echo "No automatic install for this OS. Get Docker at https://docs.docker.com/get-docker/"
    exit 1
  fi
}

ensure_docker

echo "==> Building credits-gg:local"
cd "$REPO_ROOT"
docker build -t credits-gg:local .

echo "==> Starting container (http://localhost:8080)"
docker rm -f credits-gg-local >/dev/null 2>&1 || true
docker run -d --name credits-gg-local -p 8080:80 --restart unless-stopped credits-gg:local >/dev/null

echo "Done — open http://localhost:8080"
echo "Stop with: docker stop credits-gg-local"
