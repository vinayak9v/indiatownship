#!/usr/bin/env bash
# Executed on VPS by GitHub Actions CD workflow.
# Expects: IMAGE_TAG and GITHUB_REPO env vars set by caller.
set -euo pipefail

APP_DIR="/opt/indiatownship"

echo "==> Pulling images (tag: ${IMAGE_TAG})"
cd "$APP_DIR"

IMAGE_TAG="$IMAGE_TAG" GITHUB_REPO="$GITHUB_REPO" \
  docker compose pull

echo "==> Restarting services"
IMAGE_TAG="$IMAGE_TAG" GITHUB_REPO="$GITHUB_REPO" \
  docker compose up -d --remove-orphans

echo "==> Cleaning unused images"
docker image prune -f

echo "✅ Deploy complete — tag: ${IMAGE_TAG}"
