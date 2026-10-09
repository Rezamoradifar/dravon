# Original Dravon experience fixes

This branch is based on main at `2d199222cbf9643306ac4c2c1e479b6199d35146`. The landing page, global styles, layout, dependencies, contract addresses, package prices and contract rules are unchanged. It supersedes the rejected showcase proposal; do not deploy that proposal.

- Registration and charging distinguish unavailable contract data from an unregistered account. Reads use the configured project chain, with retry for failed account reads.
- Connected wallets on another chain see a network-switch prompt. Writes require a factory-confirmed active window and block simultaneous submissions.
- Successful receipts are required for successful transaction and approval messages. A mined revert never completes the registration stepper. Confirmation lookup failure leaves the transaction pending.
- USDT approval requests the amount needed for the selected payment, rather than unlimited allowance. Existing wallet allowances are not revoked by this change.
- Invalid BNB amounts are rejected without crashing. Suggested amounts follow package changes; manually edited values are preserved until the package, wallet or spender changes.
- Invalid, zero and self sponsor addresses are blocked. Editing the direct sponsor clears placement, and an outdated asynchronous suggestion cannot replace the current sponsor's placement.
- The dashboard shows live account state, debt, remaining period cap, and account/network actions. The cap is not displayed as a withdrawable balance or promised earnings.
- The genealogy page has a searchable member list, size presets, a 1–255 node limit, and resets selection when changing the viewed tree. Empty positions cannot open a member panel.
- Explorer receipts take precedence over stale browser history, transaction links use recorded chain IDs, and unavailable explorer history is explicitly reported. Legacy records without chain IDs have no guessed explorer link.
- Six USD market quotes refresh every 30 seconds, with provider timestamps, cache deduplication and a stale label after provider failure. The feed is informational, not a payment quote.
- The sample environment file leaves deployment overrides empty to use checked-in defaults. Existing production environment files must be preserved.

## Validation

Run `node scripts/tests/original-experience.cjs` for payment validation, unknown registration states, tree bounds, chain-aware history, market failure/cache behavior, wrong-chain writes, duplicate submit protection, reverted receipts and bounded approvals. Run `npx tsc --noEmit` and `npm run build` with the installation's actual WalletConnect project ID. Local build verification used a test-only ID; it is not a deployable credential.

UI checks cover disconnected dashboard, registration, charging, Persian translations and tree-size validation. Connected wallet and production transaction behavior still require a wallet test on the configured deployment; no transactions were sent in this review.

## Existing server deployment

The supplied server observations identify `/root/dravon-main`, PM2 process `dravon`, and port `3000`. No change has been executed on that server. Keep its `.env*`, data directory and PM2 configuration. Do not install a second site or touch `dravon-bot`, Nova services, or the separate Next service on port `3004`.

Before deploying this reviewed revision, snapshot the existing source and `.next` outside the application directory. Build the reviewed source in a staging directory using the same dependencies and production environment; if the build fails, leave the running process unchanged. Then update the application source and build and restart only `pm2 restart dravon`. Verify `http://127.0.0.1:3000/`, `/dashboard`, `/register`, and `/charge`, and inspect `pm2 logs dravon --lines 50 --nostream`. On failure restore both source and `.next` from the snapshot and restart only that process.

If the rejected showcase is still deployed, restore `app/page.tsx`, `app/layout.tsx` and `app/globals.css` from this revision as part of the source update, in addition to the focused fixes. Those three files are identical to the original main revision.
