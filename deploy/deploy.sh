#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/freelance-assistant"

cd "$APP_DIR"
git pull origin main
npm install --omit=dev
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
