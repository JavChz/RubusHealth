#!/usr/bin/env bash
# RubusHealth CLI
# Installed to /usr/local/bin/rubushealth by installer

set -euo pipefail

INSTALL_DIR="$HOME/.rubushealth"
SERVICE="rubushealth"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'
BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${BLUE}${BOLD}[rubushealth]${RESET} $*"; }
success() { echo -e "${GREEN}${BOLD}✓${RESET} $*"; }
warn()    { echo -e "${YELLOW}${BOLD}⚠${RESET} $*"; }
error()   { echo -e "${RED}${BOLD}✗${RESET} $*" >&2; exit 1; }

has_systemd() { command -v systemctl &>/dev/null; }

usage() {
  echo ""
  echo -e "  ${BOLD}rubushealth${RESET} — Raspberry Pi monitoring dashboard"
  echo ""
  echo -e "  ${BOLD}Commands:${RESET}"
  echo -e "    ${BOLD}start${RESET}     Start the service"
  echo -e "    ${BOLD}stop${RESET}      Stop the service"
  echo -e "    ${BOLD}restart${RESET}   Restart the service"
  echo -e "    ${BOLD}status${RESET}    Show service status"
  echo -e "    ${BOLD}update${RESET}    Pull latest version and rebuild"
  echo -e "    ${BOLD}logs${RESET}      Show recent service logs"
  echo -e "    ${BOLD}uninstall${RESET} Remove RubusHealth completely"
  echo -e "    ${BOLD}version${RESET}   Show installed version"
  echo ""
}

CMD="${1:-help}"

case "$CMD" in
  start)
    if has_systemd; then
      sudo systemctl start "$SERVICE"
      success "Service started"
    else
      nohup node "$INSTALL_DIR/server/dist/index.js" > "$INSTALL_DIR/rubushealth.log" 2>&1 &
      success "Started (PID: $!)"
    fi
    ;;

  stop)
    if has_systemd; then
      sudo systemctl stop "$SERVICE"
      success "Service stopped"
    else
      pkill -f "server/dist/index.js" || warn "Process not found"
    fi
    ;;

  restart)
    if has_systemd; then
      sudo systemctl restart "$SERVICE"
      success "Service restarted"
    else
      pkill -f "server/dist/index.js" 2>/dev/null || true
      nohup node "$INSTALL_DIR/server/dist/index.js" > "$INSTALL_DIR/rubushealth.log" 2>&1 &
      success "Restarted (PID: $!)"
    fi
    ;;

  status)
    if has_systemd; then
      systemctl status "$SERVICE" --no-pager -l
    else
      if pgrep -f "server/dist/index.js" &>/dev/null; then
        success "Process is running"
      else
        warn "Process is not running"
      fi
    fi
    ;;

  logs)
    if has_systemd; then
      journalctl -u "$SERVICE" -n "${2:-50}" --no-pager
    else
      tail -n "${2:-50}" "$INSTALL_DIR/rubushealth.log" 2>/dev/null || warn "No log file found"
    fi
    ;;

  update)
    bash "$INSTALL_DIR/scripts/update.sh"
    ;;

  version)
    VERSION=$(cat "$INSTALL_DIR/version.json" 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['version'])" 2>/dev/null || echo "unknown")
    echo "RubusHealth v$VERSION"
    echo "Install dir: $INSTALL_DIR"
    ;;

  uninstall)
    echo ""
    warn "This will PERMANENTLY remove RubusHealth and all its data."
    read -r -p "  Are you sure? [y/N] " CONFIRM
    if [[ "${CONFIRM,,}" != "y" ]]; then
      info "Aborted."
      exit 0
    fi

    info "Stopping service..."
    if has_systemd; then
      sudo systemctl stop "$SERVICE" 2>/dev/null || true
      sudo systemctl disable "$SERVICE" 2>/dev/null || true
      sudo rm -f "/etc/systemd/system/$SERVICE.service"
      sudo systemctl daemon-reload
    else
      pkill -f "server/dist/index.js" 2>/dev/null || true
    fi

    info "Removing files..."
    rm -rf "$INSTALL_DIR"

    info "Removing CLI..."
    sudo rm -f /usr/local/bin/rubushealth

    success "RubusHealth has been completely removed."
    ;;

  help|--help|-h|"")
    usage
    ;;

  *)
    error "Unknown command: $CMD"
    usage
    exit 1
    ;;
esac
