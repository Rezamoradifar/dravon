# Moving Smart Contract Platform to another VPS (safe cutover)

This plan moves the **Next.js website** first, with a reversible release on the new VPS.
It deliberately does **not** shut down the current site, switch DNS, change contract
addresses, or start a second Telegram bot. No blockchain contract migration is implied:
the deployed BNB Smart Chain contracts remain on chain.

## Current and target

- Known OLD VPS: `104.167.16.102`, application `/root/dravon-main`,
  PM2 names `dravon` and `dravon-bot` (verify these at cutover).
- NEW VPS: `<NEW_IP>` — not specified yet. Do **not** assume any existing
  server running a different project is available.
- New code and runtime: `/opt/smart-contract-platform`.
- Frontend default: bound to `127.0.0.1:3000` behind Nginx + HTTPS.
- Source branch: `codex/dravon-vps-premium-20261111`.
- Deploy script: `scripts/install-new-vps.sh`.

## 1. Verify and back up the OLD server

These commands are read-only except for any backup you explicitly create.

```bash
ssh root@104.167.16.102
pm2 status
cd /root/dravon-main
test -s .env.local && echo "Environment file exists"
test -d data && echo "Local data directory exists"
du -sh data 2>/dev/null || true
# Back up .env.local, data/, VPN SSH keys and any external bot data to a
# PRIVATE location using your normal backup method. Never upload secrets to GitHub.
```

The repo does not contain the production `.env.local`, live `data/`,
VPN host private keys or external Telegram state. Copy or reconfigure the
items this deployment uses; a Git clone alone is not a complete migration.

## 2. Prepare a fresh NEW VPS

Ubuntu 22.04/24.04 or a supported Debian release, at least 8 GiB free disk
space, 4 GiB RAM recommended (builds may need additional swap). Install
Git, curl, Node.js **22+**, npm and PM2 from their trusted distributions.
The deploy script checks these tools and stops if any are missing.

```bash
ssh root@<NEW_IP>
apt-get update
apt-get install -y git curl rsync nginx ca-certificates
node --version             # should be v22 or newer
npm --version
npm install -g pm2
install -d -m 700 /opt/smart-contract-platform/shared
install -d -m 700 /opt/smart-contract-platform/shared/data
```

For Node.js setup use the official Node.js 22 installation instructions
for the target operating system; verify `node --version` before proceeding.

**Securely transfer** the OLD server's `/root/dravon-main/.env.local` to
`/opt/smart-contract-platform/shared/.env.local` on the NEW server, using
SCP/SFTP over SSH. Then on NEW:

```bash
chmod 600 /opt/smart-contract-platform/shared/.env.local
```

If OLD `/root/dravon-main/data/` exists and holds production data, securely
sync its *contents* to NEW
`/opt/smart-contract-platform/shared/data/` before the cutover, preserving
ownership and permissions. Review any external file paths referenced from
`.env.local` such as `VPN_SERVER_SSH_KEY_PATH`; they must exist on NEW too.
Review `NEXT_PUBLIC_SITE_URL` and `SITE_BASE_URL` if the public domain changes.
Never post private keys, bot tokens or complete `.env.local` into chat.

## 3. Build and launch the new site

```bash
cd /opt
git clone --depth=1 --branch codex/dravon-vps-premium-20261111 \
  https://github.com/Rezamoradifar/dravon.git smart-contract-installer
cd smart-contract-installer
bash scripts/install-new-vps.sh
```

A deployment creates an isolated `releases/build.*` folder, runs `npm ci`
and `npm run build`, updates a `current` symlink, starts/reloads
`smart-contract-platform` with PM2, and performs an HTTP health check.
If startup or the health check fails, the script restores the prior release
on the NEW server. It never affects the OLD server or starts the bot.

```bash
pm2 status
pm2 logs smart-contract-platform --lines 60
curl -fI http://127.0.0.1:3000/
readlink -f /opt/smart-contract-platform/current
```

For future updates, fetch a fresh checkout in the installer directory and
run the same install script; secrets stay outside the Git checkout.

## 4. Nginx, domain and HTTPS

After an actual domain is chosen, point a temporary subdomain at the NEW
server and place the following in a Nginx server block (replace the placeholder):

```nginx
server {
    listen 80;
    server_name <YOUR_DOMAIN>;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Check `nginx -t`, reload Nginx, issue a TLS certificate for the actual
domain with Certbot or your chosen reverse proxy, and enforce HTTPS.
Keep port 3000 bound to localhost; allow only the required SSH/HTTP/HTTPS
ports through the firewall. Connect-wallet flows require a trusted HTTPS
origin in many browsers.

## 5. Cutover checklist — only after a passing preview

1. Confirm landing, dashboard, register, history, genealogy, wallet
   connection, network reads, VPN APIs and administrator role behavior.
   Do not test irreversible on-chain actions with meaningful live funds.
2. Verify chain ID, Factory/Window addresses, external RPCs, BscScan links,
   admin wallet, WalletConnect project ID and URL/environment settings.
3. If local data changes while OLD stays live, perform a final delta sync
   just before cutover to avoid lost writes.
4. After confirming that only one Telegram polling bot may run,
   **stop `dravon-bot` on OLD first**. Then start on NEW:

```bash
cd /opt/smart-contract-platform/current
pm2 start npm --name smart-contract-platform-bot -- run telegram-bot
pm2 save
pm2 status
```

5. Switch DNS only when NEW is verified. Keep OLD site and backups intact
   until SSL, wallet sessions, app routes, bot and local data are verified.
6. For reverts, switch DNS back and restart OLD bot only after the new bot
   is stopped, avoiding duplicate Telegram polling.

This installation process changes the website deployment, not the
underlying smart contracts. All payment / withdrawal / wallet functionality
must be verified against the actual live contract before production cutover.
