#!/usr/bin/env bash
# RubusHealth updater
# Usage: rubushealth update
#    or: bash ~/.rubushealth/scripts/update.sh

set -euo pipefail

BLUE='\033[0;34m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${BLUE}${BOLD}[RubusHealth]${RESET} $*"; }
success() { echo -e "${GREEN}${BOLD}✓${RESET} $*"; }
warn()    { echo -e "${YELLOW}${BOLD}⚠${RESET} $*"; }

INSTALL_DIR="$HOME/.rubushealth"

if [[ ! -d "$INSTALL_DIR/.git" ]]; then
  echo "RubusHealth is not installed at $INSTALL_DIR"
  echo "Run the installer first: curl -fsSL https://raw.githubusercontent.com/JavChz/RubusHealth/main/scripts/install.sh | bash"
  exit 1
fi

info "Checking for updates..."
cd "$INSTALL_DIR"

LOCAL=$(git rev-parse HEAD)
git fetch --quiet origin main
REMOTE=$(git rev-parse origin/main)

if [[ "$LOCAL" == "$REMOTE" ]]; then
  success "Already up to date ($(git describe --tags --always 2>/dev/null || echo 'latest'))"
  exit 0
fi

info "Update found. Pulling changes..."
git pull --quiet origin main
success "Code updated"

info "Installing dependencies..."
npm install --quiet
success "Dependencies ready"

info "Building..."
npm run build --workspace=web --silent
npm run build --workspace=server --silent
success "Build complete"

info "Restarting service..."
if command -v systemctl &>/dev/null && systemctl is-active --quiet rubushealth 2>/dev/null; then
  sudo systemctl restart rubushealth
  sleep 1
  if systemctl is-active --quiet rubushealth; then
    success "Service restarted"
  else
    warn "Service restart may have failed. Check: journalctl -u rubushealth -n 20"
  fi
else
  warn "systemd not available. Please restart the process manually."
fi

success "RubusHealth updated successfully!"
