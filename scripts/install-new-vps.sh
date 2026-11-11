#!/usr/bin/env bash
# Staged, reversible deployment for a new, empty VPS.
# Run only on the NEW server. This script never connects to or alters the OLD VPS.
set -Eeuo pipefail
umask 077

APP_ROOT=${APP_ROOT:-/opt/smart-contract-platform}
RELEASE_REF=${RELEASE_REF:-codex/dravon-vps-premium-20261111}
PORT=${PORT:-3000}
BIND_HOST=${BIND_HOST:-127.0.0.1}
REPO_URL=https://github.com/Rezamoradifar/dravon.git
APP_NAME=smart-contract-platform
SHARED="$APP_ROOT/shared"
CURRENT="$APP_ROOT/current"
ECOSYSTEM="$APP_ROOT/ecosystem.config.cjs"

die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
log() { printf '[smart-contract-platform] %s\n' "$*"; }
for bin in git npm node pm2 curl mktemp mv ln; do
  command -v "$bin" >/dev/null 2>&1 || die "Missing $bin; install prerequisites first (see docs/new-vps-migration.md)"
done
[[ "$APP_ROOT" == /* ]] || die "APP_ROOT must be an absolute path"
[[ "$PORT" =~ ^[0-9]+$ ]] && (( PORT > 0 && PORT < 65536 )) || die "Invalid PORT"
[[ "$BIND_HOST" == 127.0.0.1 || "$BIND_HOST" == 0.0.0.0 ]] || die "BIND_HOST must be 127.0.0.1 or 0.0.0.0"
node_major="$(node -p 'Number(process.versions.node.split(".")[0])')"
(( node_major >= 22 )) || die "Node.js 22 or newer is required"
[[ -n "$RELEASE_REF" && "$RELEASE_REF" != *" "* ]] || die "Invalid RELEASE_REF"

mkdir -p "$APP_ROOT/releases" "$SHARED"
available_kib="$(df -Pk "$APP_ROOT" | awk 'NR==2 {print $4}')"
(( available_kib >= 8 * 1024 * 1024 )) || die "Need at least 8 GiB available disk space before building"

release="$(mktemp -d "$APP_ROOT/releases/build.XXXXXXXX")"
log "Cloning source ref $RELEASE_REF to $release"
git clone --quiet --depth 1 --branch "$RELEASE_REF" "$REPO_URL" "$release"

# Fresh deployment: initialize from GitHub's public defaults, not old VPS state.
if [[ ! -e "$SHARED/.env.local" && ! -L "$SHARED/.env.local" ]]; then
  [[ "${FRESH_INSTALL:-0}" == "1" ]] || die "Missing private settings. Pass FRESH_INSTALL=1 to initialize a new instance without old data or secrets."
  [[ -f "$release/.env.example" ]] || die "Missing .env.example in new release"
  cp "$release/.env.example" "$SHARED/.env.local"
  site_origin="${SITE_ORIGIN:-http://103.208.84.28}"
  [[ "$site_origin" =~ ^https?://[a-zA-Z0-9._:-]+$ ]] || die "Invalid SITE_ORIGIN"
  sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=$site_origin|" "$SHARED/.env.local"
  log "Created fresh environment with v7.4 addresses; old VPS data and secrets are not restored."
fi

[[ -f "$SHARED/.env.local" && ! -L "$SHARED/.env.local" ]] || die "Environment file must be a real file"
chmod 600 "$SHARED/.env.local"
for key in NEXT_PUBLIC_FACTORY_ADDRESS NEXT_PUBLIC_WINDOW_ADDRESS NEXT_PUBLIC_WEEKLY_WINDOW_ADDRESS; do
  grep -Eq "^$key=0x[0-9a-fA-F]{40}$" "$SHARED/.env.local" || die "Missing or malformed $key"
done
if grep -Eiq '^NEXT_PUBLIC_FACTORY_ADDRESS=0x4c7c8060580b6b5eb50da04ad06fb26b4e7159c3$' "$SHARED/.env.local"; then
  die "The old v7.1 Factory is shut down. Correct contract addresses before installing."
fi
if ! grep -Eq '^NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=.+$' "$SHARED/.env.local"; then
  log "WARNING: Reown/WalletConnect Project ID is empty; wallet connection requires configuration and rebuild."
fi
if ! grep -Eq '^NEXT_PUBLIC_ADMIN_ADDRESS=0x[0-9a-fA-F]{40}$' "$SHARED/.env.local"; then
  log "WARNING: Admin panel is unavailable until the owner's real wallet address is configured and rebuilt."
fi

ln -s "$SHARED/.env.local" "$release/.env.local"
mkdir -p "$SHARED/data"
[[ ! -e "$release/data" && ! -L "$release/data" ]] || die "Release unexpectedly contains data path"
ln -s "$SHARED/data" "$release/data"

log "Installing exact locked dependencies and compiling production assets"
(
  cd "$release"
  npm ci --no-audit --no-fund
  npm run build
)
commit="$(git -C "$release" rev-parse HEAD)"
log "Built commit $commit"

previous=""
if [[ -L "$CURRENT" ]]; then
  previous="$(readlink -f "$CURRENT")"
elif [[ -e "$CURRENT" ]]; then
  die "$CURRENT is not a symlink; refusing to replace it"
fi

# An unrelated service may already use the default port on this VPS.
# Never mistake its HTTP 200 response for our own successful deployment.
if [[ -z "$previous" ]]; then
  if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    die "PM2 already manages $APP_NAME but no matching current symlink exists; inspect before proceeding"
  fi
  if (echo >/dev/tcp/127.0.0.1/"$PORT") >/dev/null 2>&1; then
    die "Port $PORT already has a listener; select a free PORT without stopping other apps"
  fi
fi

# This file lives outside releases and is not clobbered by future code updates.
cat > "$ECOSYSTEM" <<EOF
module.exports = {
  apps: [{
    name: "$APP_NAME",
    cwd: "$CURRENT",
    script: "$CURRENT/node_modules/next/dist/bin/next",
    args: "start -p $PORT -H $BIND_HOST",
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    max_memory_restart: "1G",
    env: { NODE_ENV: "production" }
  }]
};
EOF

switch_current() {
  local destination="$1"
  local temp="$APP_ROOT/.current.next.$$"
  ln -s "$destination" "$temp"
  mv -Tf "$temp" "$CURRENT"
}
rollback() {
  log "Deployment health check failed; restoring previous release"
  if [[ -n "$previous" ]]; then
    switch_current "$previous"
    pm2 startOrReload "$ECOSYSTEM" --update-env || true
  else
    pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
    rm -f "$CURRENT"
  fi
}
switch_current "$release"
if ! pm2 startOrReload "$ECOSYSTEM" --update-env; then
  rollback
  die "PM2 could not start the new release"
fi

healthy=0
for _ in $(seq 1 30); do
  if curl --silent --show-error --fail --max-time 5 "http://127.0.0.1:$PORT/api/health" 2>/dev/null | grep -Fq '"service":"smart-contract-platform"'; then
    healthy=1
    break
  fi
  sleep 2
done
if (( healthy != 1 )); then
  rollback
  die "Application did not pass HTTP smoke check"
fi

pm2 save >/dev/null
log "HEALTHY: http://$BIND_HOST:$PORT/"
log "Release commit: $commit"
log "Telegram bot has not been started; old VPS was not contacted."
log "Next: configure Nginx/TLS. Set real WalletConnect/admin parameters before enabling user transactions."
