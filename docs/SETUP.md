# Setup for a human

## 0. What you need
Node 20 or newer (22 tested), git. Optional: bun (faster; the repo has `bun.lock`).

## 1. One command (macOS, Linux, WSL)
```bash
curl -fsSL https://raw.githubusercontent.com/Maliot100X/WhoopRakazaTerminaln/main/scripts/setup.sh | bash
```
It clones the repo, installs, type-checks and builds. It stops with a clear message if Node is missing or too old.

## 2. Or by hand
```bash
git clone https://github.com/Maliot100X/WhoopRakazaTerminaln.git
cd WhoopRakazaTerminaln
npm install          # or: bun install
npx tsc --noEmit     # must print nothing
npm run build        # must end with "[whop] packed ... files"
npm run dev          # http://localhost:3000  then open /terminal
```
Windows without WSL: run the same four commands in PowerShell; skip `scripts/*.sh`.

## 3. Check it like a pro (optional, needs a Linux/macOS shell)
```bash
bash scripts/qa-setup.sh                                  # installs headless Chromium (+ system libs on Debian/Ubuntu)
npm run dev &                                             # keep it running
node tools/shot.mjs http://localhost:3000/terminal "Rakaza 3D" avatar.png 390 844
node tools/shot.mjs http://localhost:3000/terminal "Universe"  universe.png 390 844
node tools/terminal-smoke.mjs                              # prints the demo-terminal transcript
```
Open the PNGs. The avatar must face you, be fully in the frame, and not be covered by the buttons.

## 4. Troubleshooting
| Symptom | Cause | Fix |
|---|---|---|
| `Cannot find module '@whop/cli/vite'` | install failed or old lockfile | delete `node_modules`, run `npm install` again |
| `tsc` complains about `routeTree.gen.ts` | generated file missing | run `npm run build` once, it regenerates it |
| Blank 3D area, console says WebGL | no GPU/WebGL (some VMs) | use a normal browser, or the headless flags in `tools/shot.mjs` |
| Avatar tab stuck on "Summoning Rakaza" | the 4 MB `rakaza.vrm` blocked or slow | check `/brand/rakaza.vrm` returns 200 |
| Market tab empty | DexScreener rate limit | wait a minute, press refresh |
| Launches say "Couldn't load live data" | Vercel terminal down or changed API | open https://rakaza-ai-terminal.vercel.app/api/public/tokens |
| Headless Chromium: `libglib-2.0.so.0 not found` | missing system libs | `bash scripts/qa-setup.sh` |
| `curl localhost:3200` does nothing on your PC | that is the simulated terminal | to run the real thing: clone `Maliot100X/RakazaAiTerminal`, `npm i`, `npm run dev` (it listens on 3200) |

## 5. Environment variables (optional)
The app needs none. If you add Whop API features, copy `.env.example` to `.env.local` and fill in `WHOP_API_KEY` and `NEXT_PUBLIC_WHOP_APP_ID` from your Whop developer dashboard. `.env.local` is git-ignored (`*.local`). On Whop hosting, put the key in an app secret instead. Never paste keys into chat or commit them.
