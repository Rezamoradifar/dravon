# Fresh install without access to old server (103.208.84.28)

This is an **independent fresh website installation**, not recovery of the
previous VPS, and it does not erase or move existing blockchain state.
Source: `Rezamoradifar/dravon`, branch `codex/dravon-vps-premium-20261111`.

## 1. On the NEW server, run as an authorized administrator

```bash
ssh root@103.208.84.28
df -h /
free -m
ss -ltnp | grep -E ':(80|443|3000)\\b' || true
```

Ensure enough storage (the installer requires 8 GiB free), and do not displace
services already using a port. Ubuntu 22.04/24.04 installation example:

```bash
apt-get update
apt-get install -y curl git nginx ca-certificates rsync
curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/node-setup.sh
bash /tmp/node-setup.sh
apt-get install -y nodejs
npm install -g pm2
node --version  # must be 22 or newer
```

Using system-wide Node.js might affect other applications on a shared server.
Review existing deployments before upgrading system packages.

## 2. Fetch and install (NO former VPS credentials necessary)

```bash
cd /opt
git clone --depth=1 --branch codex/dravon-vps-premium-20261111 \
  https://github.com/Rezamoradifar/dravon.git smart-contract-installer
cd /opt/smart-contract-installer
FRESH_INSTALL=1 bash scripts/install-new-vps.sh
```

The installer will create a new `/opt/smart-contract-platform/shared/.env.local`
using current v7.4 contract addresses from the repo's now-updated example file.
It leaves all secrets empty, including WalletConnect, Telegram and VPN.
It only starts the web service bound to **127.0.0.1:3000**, not the bot.

A different local port can be selected without disturbing existing processes:

```bash
PORT=3300 FRESH_INSTALL=1 bash scripts/install-new-vps.sh
```

If the script reports an existing configuration or port conflict, inspect
the issue instead of deleting files or stopping another application.

## 3. Check local installation

```bash
pm2 status
pm2 logs smart-contract-platform --lines 30 --nostream
curl -fsS http://127.0.0.1:3000/api/health
```

If you chose `PORT=3300`, use that port for HTTP and Nginx.

Expected health response:

```json
{"service":"smart-contract-platform","status":"ok"}
```

A successful health response means the HTTP server is reachable; it does **not**
prove wallet actions or payment transactions can be completed.

## 4. Public IP preview behind Nginx

First check that no existing Nginx site already handles the exact IP:

```bash
nginx -T 2>/dev/null | grep 'server_name 103.208.84.28' || true
```

Only if there is no conflict, create a new site:

```bash
cat >/etc/nginx/sites-available/smart-contract-platform <<'NGINX'
server {
    listen 80;
    server_name 103.208.84.28;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
ln -s /etc/nginx/sites-available/smart-contract-platform \
  /etc/nginx/sites-enabled/smart-contract-platform
nginx -t && systemctl reload nginx
```

Open `http://103.208.84.28/` for a temporary preview once network/firewall
allows inbound port 80. HTTPS on a real domain is recommended before any
wallet or transaction feature is enabled.

## 5. Restore integration capabilities individually

- To enable QR/mobile WalletConnect pairing, get a real Reown Project ID from https://cloud.reown.com
  and configure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in the **private**
  `/opt/smart-contract-platform/shared/.env.local`. Then rerun the installer
  to rebuild the public bundle. Without this ID, only injected browser wallets
  such as installed MetaMask may be available.
- Set `NEXT_PUBLIC_ADMIN_ADDRESS` to the **public wallet address** that is
  authorized by the actual on-chain contracts. This only affects UI visibility;
  the contracts enforce authority.
- Configure VPN backend, payment recipient, keys and independent
  Telegram credentials only if they are legitimately available. Do not invent
  old credentials or run two polling bots simultaneously.
- Historical balances/registrations stored **on-chain** can be read by wallet
  from the existing BNB Smart Chain contracts. Historical **local** records,
  private bots, files and secret keys cannot be reconstructed from this repo.

**Never use private wallet seed phrases or private keys in this environment file.**
The production site is ready for user wallet transactions only after real
deployment, WalletConnect configuration, HTTPS and end-to-end checks.
