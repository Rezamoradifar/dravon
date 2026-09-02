#!/usr/bin/env bash
set -euo pipefail

# Provisions one new WireGuard peer. Called remotely over SSH by
# /app/api/admin/vpn/provision on the site's server, only after a real
# on-chain USDT payment has been verified. Prints the finished client
# .conf to stdout for the admin panel to hand to the paying user.
#
# Install this at /opt/dravon-vpn/add-peer.sh on the VPN server (after
# running setup-server.sh once), chmod +x it, and grant the SSH user that
# connects here passwordless sudo for this exact script - see the note at
# the end of setup-server.sh.
#
# By default the client config's Endpoint is this server's own public IP
# (auto-detected via ifconfig.me). To hand out a domain name instead - so
# clients never see the raw VPN server IP - point a DNS A record at this
# server and write it once to /opt/dravon-vpn/endpoint-host, e.g.:
#   echo "vpn.yourdomain.com" > /opt/dravon-vpn/endpoint-host
#
# Usage: add-peer.sh <wallet-address> <tier>

WALLET="${1:?wallet address required}"
TIER="${2:-plus}"

WG_IFACE="wg0"
WG_DIR="/etc/wireguard"
STATE_DIR="/opt/dravon-vpn"
WG_PORT="51820"

if [[ ! "$WALLET" =~ ^0x[0-9a-fA-F]{40}$ ]]; then
  echo "Invalid wallet address" >&2
  exit 1
fi

SERVER_PUBLIC_KEY=$(cat "$WG_DIR/server_public.key")
if [ -f "$STATE_DIR/endpoint-host" ]; then
  ENDPOINT_HOST=$(cat "$STATE_DIR/endpoint-host")
else
  ENDPOINT_HOST=$(curl -s https://ifconfig.me)
fi
SERVER_ENDPOINT="$ENDPOINT_HOST:$WG_PORT"

NEXT_ID=$(cat "$STATE_DIR/next-peer-id")
if [ "$NEXT_ID" -gt 254 ]; then
  echo "VPN subnet exhausted (254 peer limit) - add another server." >&2
  exit 1
fi
PEER_IP="10.8.0.$NEXT_ID"
echo $((NEXT_ID + 1)) > "$STATE_DIR/next-peer-id"

umask 077
PEER_PRIVATE_KEY=$(wg genkey)
PEER_PUBLIC_KEY=$(echo "$PEER_PRIVATE_KEY" | wg pubkey)

{
  echo ""
  echo "# wallet=$WALLET tier=$TIER"
  echo "[Peer]"
  echo "PublicKey = $PEER_PUBLIC_KEY"
  echo "AllowedIPs = $PEER_IP/32"
} >> "$WG_DIR/$WG_IFACE.conf"

wg syncconf "$WG_IFACE" <(wg-quick strip "$WG_IFACE")

cat <<EOF
[Interface]
PrivateKey = $PEER_PRIVATE_KEY
Address = $PEER_IP/32
DNS = 1.1.1.1

[Peer]
PublicKey = $SERVER_PUBLIC_KEY
Endpoint = $SERVER_ENDPOINT
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
EOF
