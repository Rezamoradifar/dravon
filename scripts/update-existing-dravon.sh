#!/usr/bin/env bash
# Update the observed PM2 installation; build before touching the running site.
set -Eeuo pipefail
umask 077
app=/root/dravon-main
revision=56f536ded9d09d7ba02b79d44cd50d248615dbc1
for executable in node npm pm2 curl tar python3; do command -v "$executable" >/dev/null; done
[[ -d "$app" && -f "$app/package.json" ]] || { echo "Missing $app"; exit 1; }
verify_process() {
  pm2 jlist | node -e '
    let input=""; process.stdin.on("data", d => input += d); process.stdin.on("end", () => {
      const matches=JSON.parse(input).filter(p => p.name === "dravon");
      if (matches.length !== 1 || matches[0].pm2_env.pm_cwd !== "/root/dravon-main" || matches[0].pm2_env.status !== "online") {
        console.error("Expected exactly one online dravon process in /root/dravon-main. Stopped without changing the site."); process.exit(1);
      }
    });'
}
verify_process
work=$(mktemp -d /root/dravon-update-XXXXXXXX)
stage="$work/release"
backup="$work/backup"
mkdir -p "$stage" "$backup"
echo "Preparing revision $revision"
echo "Working directory: $work"
curl --fail --location --retry 2 --connect-timeout 15 --max-time 180 \
  "https://codeload.github.com/Rezamoradifar/dravon/tar.gz/$revision" -o "$work/release.tgz"
tar -xzf "$work/release.tgz" --strip-components=1 -C "$stage"
# Preserve production configuration. Environment files never get copied back from staging.
for file in .env .env.local .env.production .env.production.local; do
  if [[ -f "$app/$file" ]]; then cp -p "$app/$file" "$stage/$file"; fi
done
cd "$stage"
npm ci --include=dev --no-audit --no-fund
# Public build-time settings can also be configured directly on the PM2 process.
pm2 jlist > "$work/pm2.json"
node - "$work/pm2.json" <<'NODE'
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const { loadEnvConfig } = require('@next/env');
const processInfo = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).find(p => p.name === 'dravon');
for (const [key, value] of Object.entries(processInfo.pm2_env)) {
  if (key.startsWith('NEXT_PUBLIC_') && typeof value === 'string') process.env[key] = value;
}
process.env.NODE_ENV = 'production';
loadEnvConfig(process.cwd(), false);
const id = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
if (!id || /^0+$/.test(id)) {
  console.error('A real NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required. Production was not changed.');
  process.exit(1);
}
const result = spawnSync('npm', ['run', 'build'], {
  stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }
});
process.exit(result.status ?? 1);
NODE
node scripts/tests/original-experience.cjs
[[ -s "$stage/.next/BUILD_ID" ]]
verify_process
# Snapshot source. Live environment files and user data remain in place throughout.
tar --exclude='./node_modules' --exclude='./.next' --exclude='./.git' \
  --exclude='./data' --exclude='./.env*' -czf "$backup/source.tgz" -C "$app" .
cat > "$backup/rollback.sh" <<'ROLLBACK'
#!/usr/bin/env bash
set -Eeuo pipefail
app=/root/dravon-main
backup=$(cd -- "$(dirname -- "$0")" && pwd)
[[ -s "$backup/source.tgz" ]]
pm2 stop dravon
for directory in .next node_modules; do
  if [[ -d "$backup/$directory" ]]; then
    if [[ -e "$app/$directory" ]]; then mv "$app/$directory" "$backup/failed-${directory#.}-$(date +%s%N)"; fi
    mv "$backup/$directory" "$app/$directory"
  fi
done
tar -xzf "$backup/source.tgz" -C "$app"
pm2 restart dravon
curl --noproxy '*' --fail --retry 10 --retry-connrefused --retry-delay 1 --max-time 5 http://127.0.0.1:3000/ >/dev/null
echo "Previous source, dependencies and build restored."
ROLLBACK
chmod 700 "$backup/rollback.sh"
rollback_on_error() {
  result=$?
  trap - ERR
  echo "Update failed; restoring the previous installation."
  if ! bash "$backup/rollback.sh"; then
    echo "Automatic rollback could not complete. Run: bash $backup/rollback.sh"
  fi
  exit "$result"
}
trap rollback_on_error ERR
# Downtime starts only after the staging build and tests have passed.
pm2 stop dravon
for directory in .next node_modules; do
  if [[ -e "$app/$directory" ]]; then mv "$app/$directory" "$backup/$directory"; fi
  mv "$stage/$directory" "$app/$directory"
done
python3 - "$stage" "$app" <<'PY'
import shutil, sys
from pathlib import Path
source, target = map(Path, sys.argv[1:])
for item in source.iterdir():
    if item.name in {'.git', 'data', '.next', 'node_modules'} or item.name.startswith('.env'):
        continue
    destination = target / item.name
    if item.is_dir():
        shutil.copytree(item, destination, dirs_exist_ok=True)
    else:
        shutil.copy2(item, destination)
PY
pm2 restart dravon
for route in / /dashboard /register /charge; do
  curl --noproxy '*' --fail --retry 10 --retry-connrefused --retry-delay 1 --max-time 5 \
    "http://127.0.0.1:3000$route" >/dev/null
done
verify_process
trap - ERR
printf '%s\n' "$backup" > /root/dravon-last-update-backup.txt
echo "Update complete: $revision"
echo "Rollback: bash $backup/rollback.sh"
pm2 logs dravon --lines 30 --nostream
