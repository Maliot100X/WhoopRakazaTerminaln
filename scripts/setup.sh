#!/usr/bin/env bash
# One-command setup for WhoopRakazaTerminaln.
#   curl -fsSL https://raw.githubusercontent.com/Maliot100X/WhoopRakazaTerminaln/main/scripts/setup.sh | bash
# Or, inside a clone:  bash scripts/setup.sh
# What it does: checks Node, clones the repo if needed, installs dependencies, type-checks, builds.
set -euo pipefail

REPO="https://github.com/Maliot100X/WhoopRakazaTerminaln.git"
DIR="WhoopRakazaTerminaln"

say() { printf '\n\033[1;35m==> %s\033[0m\n' "$*"; }
fail() { printf '\n\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

command -v node >/dev/null || fail "Node.js is missing. Install Node 20 or newer from https://nodejs.org and run this again."
NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
[ "$NODE_MAJOR" -ge 20 ] || fail "Node $NODE_MAJOR is too old. Use Node 20+ (22 is what this was built on)."
command -v git >/dev/null || fail "git is missing. Install git and run this again."

if [ ! -f package.json ] || ! grep -q '"name": "rakazaiterminal"' package.json; then
  say "Cloning $REPO"
  [ -d "$DIR" ] || git clone --depth 1 "$REPO" "$DIR"
  cd "$DIR"
fi

# Prefer bun (the repo ships bun.lock). Fall back to npm, which also works.
if command -v bun >/dev/null; then PM=bun; INSTALL="bun install"; RUN="bun run"; else PM=npm; INSTALL="npm install --no-audit --no-fund"; RUN="npm run"; fi
say "Installing dependencies with $PM"
$INSTALL

say "Type-checking"
npx tsc --noEmit

say "Building (client + Cloudflare Worker bundle)"
$RUN build

cat <<MSG

Done. Everything built with no errors.

Next:
  $RUN dev                      # http://localhost:3000  (open /terminal)
  bash scripts/qa-setup.sh      # optional: headless browser for screenshots and the terminal smoke test
  see docs/DEPLOY-TO-WHOP.md    # put it on a whop.site address

MSG
