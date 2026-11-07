#!/usr/bin/env bash
# Optional: installs a headless Chromium so you can screenshot the 3D tabs and smoke-test the terminal.
# On a fresh Debian/Ubuntu box the browser needs system libraries; this installs them (needs root/sudo).
set -euo pipefail
cd "$(dirname "$0")/../tools"
npm install --no-audit --no-fund
npx playwright install chromium
if [ "$(uname)" = "Linux" ] && command -v apt-get >/dev/null; then
  SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO="sudo"
  $SUDO apt-get update -qq
  # libasound2t64 is the Debian 13 / Ubuntu 24.04 name. Older releases call it libasound2.
  $SUDO apt-get install -y -qq libglib2.0-0 libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libdbus-1-3 libx11-6 \
    libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 libgbm1 libxcb1 libxkbcommon0 libpango-1.0-0 libcairo2 libcups2 \
    && ($SUDO apt-get install -y -qq libasound2t64 || $SUDO apt-get install -y -qq libasound2)
fi
echo "Ready. Try:  node tools/shot.mjs http://localhost:3000/terminal 'Rakaza 3D' out.png 390 844"
