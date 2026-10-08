#!/usr/bin/env bash
# Ubuntu/Debian + systemd. Run as root; preserves an existing .env.local.
set -euo pipefail
APP_DIR="${1:-/opt/dravon-showcase}"
APP_PORT="${2:-3080}"
BRANCH="feat/dravon-luxury-showcase"
REPO="https://github.com/Rezamoradifar/dravon.git"
SERVICE="dravon-showcase"
APP_USER="dravon-web"
[[ "$EUID" -eq 0 ]] || { echo 'Run with sudo bash.' >&2; exit 1; }
[[ "$APP_DIR" =~ ^/opt/[a-zA-Z0-9/_-]+$ ]] || { echo 'Choose a directory under /opt without spaces.' >&2; exit 1; }
[[ "$APP_PORT" =~ ^[0-9]+$ ]] && (( APP_PORT >= 1024 && APP_PORT <= 65535 )) || { echo 'Invalid port.' >&2; exit 1; }
for tool in git node npm systemctl curl runuser; do
  command -v "$tool" >/dev/null || { echo "Missing dependency: $tool" >&2; exit 1; }
done
node -e 'if (Number(process.versions.node.split(".")[0]) < 22) process.exit(1)' || { echo 'Install Node.js 22 or later first.' >&2; exit 1; }
if command -v ss >/dev/null && ss -ltnH "sport = :$APP_PORT" | read -r _; then
  systemctl is-active --quiet "$SERVICE" || { echo "Port $APP_PORT is occupied; select another port." >&2; exit 1; }
fi
git_app() { git -c safe.directory="$APP_DIR" -C "$APP_DIR" "$@"; }
if [[ -d "$APP_DIR/.git" ]]; then
  [[ "$(git_app remote get-url origin)" == "$REPO" ]] || { echo 'The directory belongs to another repository.' >&2; exit 1; }
  git_app diff --quiet && git_app diff --cached --quiet || { echo 'Save local code changes before updating.' >&2; exit 1; }
  git_app fetch origin "$BRANCH"
  git_app checkout "$BRANCH"
  git_app merge --ff-only "origin/$BRANCH"
else
  [[ ! -e "$APP_DIR" ]] || { echo 'The target directory already exists without a Git checkout.' >&2; exit 1; }
  git clone --branch "$BRANCH" --single-branch "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"
# Use contract defaults from the current source, not the older env template.
if [[ ! -e .env.local ]]; then
  printf 'NEXT_PUBLIC_CHAIN_ID=56\nMAINTENANCE_MODE=false\n' > .env.local
fi
if ! node --env-file=.env.local -e 'const id=process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;process.exit(id && /^[a-fA-F0-9]{32}$/.test(id) && !/^0+$/.test(id) ? 0 : 1)' >/dev/null 2>&1; then
  read -r -p 'Enter your real WalletConnect / Reown Project ID: ' PROJECT_ID </dev/tty
  [[ "$PROJECT_ID" =~ ^[a-fA-F0-9]{32}$ && ! "$PROJECT_ID" =~ ^0+$ ]] || { echo 'Invalid Project ID.' >&2; exit 1; }
  sed -i '/^[[:space:]]*NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=/d' .env.local
  printf '\nNEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=%s\n' "$PROJECT_ID" >> .env.local
fi
id "$APP_USER" >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin "$APP_USER"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
chmod 600 .env.local
# The service is stopped only after configuration and source checks pass.
systemctl stop "$SERVICE" 2>/dev/null || true
runuser -u "$APP_USER" -- npm ci --no-audit --no-fund
runuser -u "$APP_USER" -- node scripts/tests/market-feed.cjs
runuser -u "$APP_USER" -- env NEXT_TELEMETRY_DISABLED=1 npm run build
NODE_BIN="$(command -v node)"
cat > "/etc/systemd/system/$SERVICE.service" <<UNIT
[Unit]
Description=Dravon showcase
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=NEXT_TELEMETRY_DISABLED=1
ExecStart=$NODE_BIN $APP_DIR/node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port $APP_PORT
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now "$SERVICE"
curl --fail --silent --show-error --retry 10 --retry-connrefused --retry-delay 1 "http://127.0.0.1:$APP_PORT/" >/dev/null
systemctl is-active "$SERVICE"
printf '\nDravon is running on port %s.\nDirectory: %s\nLogs: journalctl -u %s -n 80 --no-pager\n' "$APP_PORT" "$APP_DIR" "$SERVICE"
