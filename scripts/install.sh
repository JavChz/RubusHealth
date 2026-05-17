#!/usr/bin/env bash
# RubusHealth installer
# Usage: curl -fsSL https://raw.githubusercontent.com/JavChz/RubusHealth/main/scripts/install.sh | bash

set -euo pipefail

# ── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'
BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${BLUE}${BOLD}[RubusHealth]${RESET} $*"; }
success() { echo -e "${GREEN}${BOLD}✓${RESET} $*"; }
warn()    { echo -e "${YELLOW}${BOLD}⚠${RESET} $*"; }
error()   { echo -e "${RED}${BOLD}✗ ERROR:${RESET} $*" >&2; exit 1; }

# ── Banner ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}  🫐 RubusHealth Installer${RESET}"
echo -e "  Lightweight Raspberry Pi monitoring dashboard"
echo ""

# ── OS check ────────────────────────────────────────────────────────────────
if [[ -f /etc/os-release ]]; then
  source /etc/os-release
  info "Detected OS: ${PRETTY_NAME:-unknown}"
  case "${ID:-}" in
    debian|raspbian|ubuntu) ;;
    *) warn "Non-Debian OS detected. Installation may not work correctly." ;;
  esac
else
  warn "Cannot detect OS. Proceeding anyway..."
fi

# ── Node.js check / install ─────────────────────────────────────────────────
NODE_MIN_MAJOR=18
NODE_RECOMMENDED=22

if command -v node &>/dev/null; then
  NODE_VERSION=$(node --version | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
  if (( NODE_MAJOR >= NODE_MIN_MAJOR )); then
    if (( NODE_MAJOR >= 24 )); then
      warn "Node.js $NODE_VERSION detected. Node.js 24+ has known compatibility issues"
      warn "with native addons (better-sqlite3). Upgrading to Node.js 22 LTS..."
      INSTALL_NODE=1
    else
      success "Node.js $NODE_VERSION found"
    fi
  else
    warn "Node.js $NODE_VERSION is too old (need ≥$NODE_MIN_MAJOR). Installing v${NODE_RECOMMENDED} LTS..."
    INSTALL_NODE=1
  fi
else
  info "Node.js not found. Installing v${NODE_RECOMMENDED} LTS..."
  INSTALL_NODE=1
fi

if [[ "${INSTALL_NODE:-0}" == "1" ]]; then
  info "Installing Node.js ${NODE_RECOMMENDED} LTS via NodeSource..."
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_RECOMMENDED}.x" | sudo -E bash -
  sudo apt-get install -y nodejs
  success "Node.js $(node --version) installed"
fi

# ── Git check ───────────────────────────────────────────────────────────────
if ! command -v git &>/dev/null; then
  info "Installing git..."
  sudo apt-get install -y git
fi

# ── Clone / update repo ─────────────────────────────────────────────────────
INSTALL_DIR="$HOME/.rubushealth"
REPO_URL="https://github.com/JavChz/RubusHealth.git"

if [[ -d "$INSTALL_DIR/.git" ]]; then
  warn "Existing installation found at $INSTALL_DIR"
  read -r -p "  Reinstall? (overwrites existing) [y/N] " CONFIRM
  if [[ "${CONFIRM,,}" != "y" ]]; then
    info "Keeping existing installation."
    exit 0
  fi
  info "Updating existing installation..."
  git -C "$INSTALL_DIR" pull --quiet
else
  info "Cloning repository to $INSTALL_DIR..."
  git clone --depth=1 "$REPO_URL" "$INSTALL_DIR"
fi
success "Repository ready"

# ── Install dependencies ─────────────────────────────────────────────────────
info "Installing dependencies..."
cd "$INSTALL_DIR"
npm install --quiet
success "Dependencies installed"

# ── Build ────────────────────────────────────────────────────────────────────
info "Building application..."
npm run build --workspace=web -- --silent
npm run build --workspace=server -- --silent
success "Build complete"

# ── CLI symlink ──────────────────────────────────────────────────────────────
chmod +x "$INSTALL_DIR/scripts/rubushealth.sh"
if sudo ln -sf "$INSTALL_DIR/scripts/rubushealth.sh" /usr/local/bin/rubushealth 2>/dev/null; then
  success "CLI: 'rubushealth' command installed"
else
  warn "Could not create /usr/local/bin/rubushealth (no sudo?). You can still run: $INSTALL_DIR/scripts/rubushealth.sh"
fi

# ── Systemd service ──────────────────────────────────────────────────────────
CURRENT_USER=$(whoami)
NODE_BIN=$(which node)
SERVICE_FILE="/etc/systemd/system/rubushealth.service"

SERVICE_CONTENT="[Unit]
Description=RubusHealth Monitoring Dashboard
After=network.target

[Service]
Type=simple
User=$CURRENT_USER
WorkingDirectory=$INSTALL_DIR
ExecStart=$NODE_BIN server/dist/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target"

if command -v systemctl &>/dev/null; then
  info "Installing systemd service..."
  echo "$SERVICE_CONTENT" | sudo tee "$SERVICE_FILE" > /dev/null
  sudo systemctl daemon-reload

  # Auto-start prompt
  echo ""
  read -r -p "  Enable auto-start on boot? [Y/n] " AUTOSTART
  if [[ "${AUTOSTART,,}" != "n" ]]; then
    sudo systemctl enable rubushealth
    success "Auto-start enabled"
  fi

  sudo systemctl restart rubushealth
  sleep 2

  if systemctl is-active --quiet rubushealth; then
    success "Service is running"
  else
    warn "Service may have failed to start. Check: journalctl -u rubushealth -n 20"
  fi
else
  warn "systemd not available. Starting in background..."
  nohup node "$INSTALL_DIR/server/dist/index.js" > "$INSTALL_DIR/rubushealth.log" 2>&1 &
  success "Started (PID: $!)"
fi

# ── Print access URL ─────────────────────────────────────────────────────────
DEFAULT_PORT=48721
# Try to read port from settings if they exist
SETTINGS_FILE="$HOME/.rubushealth/data/settings.json"
if [[ -f "$SETTINGS_FILE" ]]; then
  SAVED_PORT=$(python3 -c "import json; d=json.load(open('$SETTINGS_FILE')); print(d.get('port', $DEFAULT_PORT))" 2>/dev/null || echo "$DEFAULT_PORT")
else
  SAVED_PORT=$DEFAULT_PORT
fi

# Get local IP
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo ""
echo -e "${BOLD}${GREEN}  🎉 RubusHealth installed successfully!${RESET}"
echo ""
echo -e "  Access your dashboard at:"
echo -e "  ${BOLD}${BLUE}  http://$LOCAL_IP:$SAVED_PORT${RESET}"
echo -e "  ${BOLD}${BLUE}  http://localhost:$SAVED_PORT${RESET}"
echo ""
echo -e "  CLI commands:"
echo -e "    ${BOLD}rubushealth status${RESET}   — check service status"
echo -e "    ${BOLD}rubushealth update${RESET}   — pull latest version"
echo -e "    ${BOLD}rubushealth restart${RESET}  — restart service"
echo -e "    ${BOLD}rubushealth stop${RESET}     — stop service"
echo -e "    ${BOLD}rubushealth uninstall${RESET} — remove completely"
echo ""
