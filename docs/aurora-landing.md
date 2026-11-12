# Aurora landing redesign

This page borrows the **information-architecture rhythm** of the owner's Global Drop Trade landing (Rezamoradifar/Gloucestershire), not its black/gold visual identity or commerce imagery.

## Original visual identity

- Pearl background: #f6f9ff
- Cobalt blue: #3457f3
- Azure / cyan: #0aaac2
- Lavender: #8a70ec
- Midnight-indigo sections: #111f45

The three-dimensional illustration is original CSS (no borrowed images). The layout supports reduced motion and desktop/tablet/mobile.

## Landing structure

Header → hero illustration and launch CTA → on-chain facts → challenge → three-layer core model → interactive five-step walkthrough → technology explainer → functional ecosystem links → transparent user journey → real FAQ → closing CTA → footer.

## Data integrity and interactions

- Main facts are from useMainBulkInfo(0), with an unavailable state instead of invented counts.
- Example entry tiers are the three documented contract-defined values: $11, $55, $110 total.
- All walkthrough data is marked illustrative; it never connects a wallet or sends a transaction.
- Existing routes (/dashboard, /genealogy, /weekly, /pulse, /swap, /learn) remain in place.
- No claims of audits, guaranteed profit, or risk-free returns.
- On-chain contract addresses and wallet connector logic are unchanged.
- English/Persian content includes RTL/LTR support via the existing locale context.

## Safe install on the new VPS 103.208.84.28

The installed installer may still track the previous branch. The RELEASE_REF environment override tells it to clone/build this new landing as a reversible release, while preserving .env.local and the original live version.

    cd /opt/smart-contract-installer
    RELEASE_REF=codex/dravon-aurora-global-landing-20261112 bash scripts/install-new-vps.sh
    pm2 status
    curl -fsS http://127.0.0.1:3000/api/health

The script preserves Nginx/TLS config and does not start a new Telegram bot. Verify mobile display and wallet connection on https://smartchainnetwork.online before announcing production success.
