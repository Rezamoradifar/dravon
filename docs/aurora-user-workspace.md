# Aurora User Workspace (desktop + mobile)

This update carries the new ice / cobalt / cyan landing identity into the functional Smart Contract Platform, without replacing underlying business logic.

## Included
- Responsive translucent header, wallet control, language and theme switch.
- Midnight blue left navigation with accessible active route indicators and mobile drawer.
- Current round overview banner and three on-chain/wallet status values (a dash when unavailable, never sample income).
- Four functional quick actions: My Account, Genealogy, History, Registration.
- Consistent editorial section headers and cool-white cards on the dashboard.
- Personal wallet search, account metrics and weekly/referral cards styled to match.
- Shared app semantic colors updated so wallet dialogs don't inherit the previous gold accents.
- Optional dark mode remains deep navy / blue / cyan.

## Behavior deliberately unchanged
- Smart contract addresses and factory/window ABIs.
- Transaction/payment flows and actual user data.
- Wallet ID, private .env.local and server keys.
- Server Nginx, HTTPS, PM2 and Telegram bot state.

## Test workflow
The repository GitHub Actions runs:
1. Next.js production build and an HTTP health probe.
2. Wallet picker test for fresh configurations.
3. Bilingual landing browser regression.
4. Desktop and mobile account/dashboard browser regression.
5. Unit tests and install shell syntax verification.

Screenshots from the browser job are uploaded as a private run artifact named `aurora-user-panel-screenshots`.

## Installing on VPS 103.208.84.28

The old installer checkout can stay on its branch; use the RELEASE_REF override:

```bash
cd /opt/smart-contract-installer
RELEASE_REF=codex/dravon-aurora-user-panel-20261112 bash scripts/install-new-vps.sh
pm2 status
curl -fsS http://127.0.0.1:3000/api/health
```

Then open `https://smartchainnetwork.online/dashboard` and `/user` and verify wallet Connect and all on-chain reads in an actual wallet-enabled browser. This step is not performed by GitHub Actions and must not be described as completed until the new VPS is deployed and verified.

If the user prefers the prior landing-only look, switch back with:
`RELEASE_REF=codex/dravon-aurora-global-landing-20261112 bash scripts/install-new-vps.sh`.
