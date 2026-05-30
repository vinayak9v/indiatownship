#!/usr/bin/env bash
# Run once on a fresh Ubuntu 22.04 VPS as root.
# Usage: bash server-setup.sh <github_repo_owner>
set -euo pipefail

GITHUB_OWNER="${1:?Usage: $0 <github_owner>}"

echo "==> Installing Docker"
apt-get update -qq
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -qq
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

systemctl enable --now docker

echo "==> Creating deploy user"
useradd -m -s /bin/bash deploy 2>/dev/null || true
usermod -aG docker deploy

echo "==> Setting up app directory"
mkdir -p /opt/indiatownship
chown deploy:deploy /opt/indiatownship

echo "==> Installing ufw firewall rules"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "✅ Server ready."
echo "   Next steps:"
echo "   1. Copy docker-compose.yml + .env to /opt/indiatownship/"
echo "   2. Add deploy user's SSH pubkey to authorized_keys"
echo "   3. Add DEPLOY_HOST + DEPLOY_KEY to GitHub Secrets"
echo "   4. After first deploy: run certbot for SSL"
