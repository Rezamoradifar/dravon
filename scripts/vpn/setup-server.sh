#!/usr/bin/env bash
set -euo pipefail

# One-time WireGuard bootstrap for a fresh Ubuntu/Debian VPS that will back
# the dravon VPN product. Run this ONCE, as root, on the VPN server itself
# (not the main site server). After it finishes, put this machine's public
# IP into VPN_SERVER_HOST on the site's server, and copy add-peer.sh (in
# this same directory) to /opt/dravon-vpn/add-peer.sh on this machine.

WG_IFACE="wg0"
WG_PORT="51820"
WG_SERVER_IP="10.8.0.1/24"
WG_DIR="/etc/wireguard"
STATE_DIR="/opt/dravon-vpn"

apt-get update -y
apt-get install -y wireguard qrencode curl

mkdir -p "$WG_DIR" "$STATE_DIR"
chmod 700 "$WG_DIR"

if [ ! -f "$WG_DIR/server_private.key" ]; then
  umask 077
  wg genkey | tee "$WG_DIR/server_private.key" | wg pubkey > "$WG_DIR/server_public.key"
fi

SERVER_PRIVATE_KEY=$(cat "$WG_DIR/server_private.key")
EXT_IFACE=$(ip route | awk '/^default/ {print $5; exit}')

cat > "$WG_DIR/$WG_IFACE.conf" <<EOF
[Interface]
Address = $WG_SERVER_IP
ListenPort = $WG_PORT
PrivateKey = $SERVER_PRIVATE_KEY
PostUp = iptables -t nat -A POSTROUTING -o $EXT_IFACE -j MASQUERADE
PostDown = iptables -t nat -D POSTROUTING -o $EXT_IFACE -j MASQUERADE
EOF
chmod 600 "$WG_DIR/$WG_IFACE.conf"

[ -f "$STATE_DIR/next-peer-id" ] || echo 2 > "$STATE_DIR/next-peer-id"

grep -q '^net.ipv4.ip_forward=1' /etc/sysctl.conf || echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.conf
sysctl -p

systemctl enable "wg-quick@$WG_IFACE"
systemctl start "wg-quick@$WG_IFACE"

echo "----------------------------------------------------------------"
echo "WireGuard is up on this server."
echo "Server public key: $(cat "$WG_DIR/server_public.key")"
echo "Make sure UDP port $WG_PORT is open in this server's firewall/security group."
echo "Next: copy add-peer.sh to $STATE_DIR/add-peer.sh, chmod +x it, and add a"
echo "sudoers rule so the SSH user the site connects as can run it passwordlessly:"
echo "  echo 'siteuser ALL=(root) NOPASSWD: $STATE_DIR/add-peer.sh' > /etc/sudoers.d/dravon-vpn"
echo "----------------------------------------------------------------"
