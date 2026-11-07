# Agent build guide (give this whole file to an AI agent)

Goal: reproduce the Rakaza 3D terminal app on a Whop-hosted website, with no dead ends. This file is written from the real build, including every wrong turn (full list in `LESSONS-AND-FIXES.md`).

## Rules for the agent
1. Look at your own screenshots before saying anything works. Set up the headless browser first (`bash scripts/qa-setup.sh`).
2. Only say a skill, tool or link was "used" if you opened and ran it. Be explicit about what failed.
3. Never ask an image model for text. Add text with HTML.
4. Never put secrets in code. If a key is needed, stop and ask the owner for it (use an app secret, never the chat log or the repo).
5. Do not show slur/porn token names from third-party feeds.
6. Do not claim the demo terminal installs anything. It is a simulation and must say so.

## One-click prompt (paste into the Whop AI chat of the business)

```
You are in a Whop sandbox. Build and publish the Rakaza 3D terminal website from my GitHub repo.

1. Create a new website app for my selected business:
   whop-app-new --account_id <MY_BUSINESS_ID> --name "Rakaza Terminal"
   (or use the existing app: whop apps pull --app <APP_ID> --dir ~/apps/<APP_ID>). Note the app id; the project must live in ~/apps/<APP_ID>/.
2. Clone https://github.com/Maliot100X/WhoopRakazaTerminaln into /tmp/rk.
3. Copy these from /tmp/rk into ~/apps/<APP_ID>/, replacing existing files: src/ public/ docs/ scripts/ tools/ package.json bun.lock
   DO NOT copy: whop.app.json, wrangler.jsonc, vite.config.ts, tsconfig.json, tsr.config.json (the starter made correct ones for this app).
4. cd ~/apps/<APP_ID> && bun install && npx tsc --noEmit && bun run build   (both must finish with no errors)
5. Run bash scripts/qa-setup.sh, start `nohup bun run dev > /tmp/dev.log 2>&1 &`, then screenshot the tabs Universe, "Rakaza 3D", Terminal with tools/shot.mjs at 390x844 and look at them. The avatar must face the camera and be fully visible.
6. whop-publish <APP_ID>, wait until `curl -sI https://<site>/terminal` shows the new x-whop-build, then confirm the og:image tag is an absolute https URL.
7. Reply with the live link /terminal, what you verified by eye, and anything that failed. Do not delete public/media or public/brand.
Do not touch public/ files you did not need to, and remove any test screenshots you made (public/qa/) before the final publish.
```

## Full spec (if you must rebuild from nothing instead of copying)

### 0. Facts you must know
- Site runtime: Cloudflare Worker + TanStack Start. 3D must be client-only (`mounted` flag + `React.lazy`).
- Data: browser `fetch` to `https://rakaza-ai-terminal.vercel.app/api/public/{tokens,agents,leaderboard/launches,leaderboard/agents,community}` and `https://api.dexscreener.com/...`. Both allow CORS. Do not use `/api/health` (no CORS) or `/api/public/tokens/<mint>` (times out).
- Assets to copy from the original repo `Maliot100X/RakazaAiTerminal`: `public/avatar/sample_b.vrm` (VRM 0.0) as `public/brand/rakaza.vrm`, `public/brand/banner.jpg`, `docs/video/rakaza-promo-16x9.mp4` + poster, `public/songs/*.mp3`, `public/memes/*.jpg`.

### 1. Scaffold
`whop-app-new --account_id <biz> --name "Rakaza Terminal"`. Then `bun add three@0.186.1 @pixiv/three-vrm@3.5.5` and `bun add -d @types/three@0.186.0`. Put the brand tokens in `src/styles.css` (see ARCHITECTURE.md). Load fonts in `__root.tsx`.

### 2. Share tags FIRST (people share the link early)
In `__root.tsx` `head().meta`: `og:type`, `og:site_name`, `og:image` (absolute https), `og:image:width 1200`, `og:image:height 630`, `og:image:alt`, `twitter:card summary_large_image`, `twitter:image`. In `terminal.tsx` add title, description, `og:title`, `og:description`, `og:url`, `twitter:title`, `twitter:description`. Remember a route's `og:image` overrides the root one.

### 3. Image (see IMAGE-PROMPTS.md)
Generate the art with the character lock + style lock and the banner as reference. Download it immediately (signed URL expires). Render the title with `tools/make-og.mjs`. Check it by eye: nothing may cover the coin or her hand.

### 4. Tabs, in this order, verifying each by screenshot
1. **Explorer shell**: banner with scroll parallax, `h1`, tab bar (horizontal scroll on phones), `key={tab}` + `rise` animation on the panel.
2. **Universe** (`Orbit3D.tsx`): copy the numbers from LESSONS 14 to 17. Click uses a raycaster with an 8 px movement threshold so scrolling does not open a token.
3. **Rakaza 3D** (`Avatar3D.tsx`): pivot group, bone-based framing, keep `restHips`, arms ±1.28, blink every 2 to 5 s, `aa` mouth expression while typing, typed bubble, Next/Voice/Say hi buttons in one row.
4. **Terminal**: commands in `Terminal.tsx`. Label it a simulation. Real calls only to the allowed hosts.
5. **Video**: `<video controls playsInline preload="metadata" poster=...>`, songs with `preload="none"`.
6. **Market**: DexScreener boosts then `/tokens/v1/solana/<comma list>`, best pair per token by liquidity, name filter.
7. **Launches / Agents / Community / Leaderboard / About**: plain lists with `Reveal`.

### 5. Verify (all must be true)
- `npx tsc --noEmit` prints nothing; `bun run build` succeeds.
- Screenshots at 390x844 and 1280x800 of Universe, Rakaza 3D, Terminal, Video, Market look right.
- `node tools/terminal-smoke.mjs` prints the full clone → install → dev → curl → tokens → launch transcript with no `pageerror`.
- `curl -s https://<site>/terminal | grep og:image` shows an absolute https URL and that URL returns 200 with an `image/jpeg` content type.
- No `public/qa/` folder left, no tokens or keys in the repo (`git grep -nE "ghp_[A-Za-z0-9]{20}|github_pat_|sk-[A-Za-z0-9]{20}"` finds nothing).

### 6. Report
List exactly what you verified by eye, what failed, and what you did not do.

---

## Round 2 spec (everything added after the first build)

Read `docs/SKILLS-RESEARCH.md` and `docs/LESSONS-AND-FIXES.md` items 36 to 49 first.

### R2.1 Research before coding (do this, do not skip)
1. `git clone --depth 1` Nutlope/hallmark, LottieFiles/motion-design-skill, VoltAgent/awesome-design-md, cloudai-x/threejs-skills into `/tmp/skills2`. Skim `skills/*/SKILL.md`.
2. Run the linter for real: `node /tmp/skills2/hallmark/skills/hallmark/scripts/sloplint.mjs src DESIGN.md --genre playful --scope app`. Fix every FAIL.
3. Read the three.js skill for the version you use. (It is how `THREE.Clock` to `THREE.Timer` was found.)
4. Write `DESIGN.md` in the nine-section format before writing UI.
5. Say plainly in your report which skills you ran and which you only read.

### R2.2 Motion tokens
Copy the `--ease-*` and `--dur-*` tokens from `src/styles.css`. Buttons: hover 90 ms, press 140 ms (scale 0.96). Cards 320 ms. Enter 420 ms. Exit shorter than enter. Everything gated by `prefers-reduced-motion`.

### R2.3 Floating helper (`Chatbot.tsx`) and its brain
1. `src/brain/brain.md` holds identity rules, tabs, commands, recipes, errors, Solana basics, limits. Copy the original repo's `docs/ENV.md`, `DEPLOY.md`, `AI-SETUP-GUIDE.txt`, `LINKS-AND-TOOLS.txt`, `MARKET-MAP.md` into `src/brain/original/` and its `src/lib/routes-data.json` (trimmed to path, title, group, access, phase, blurb) into `src/data/routes.json`.
2. `import x from '../brain/brain.md?raw'` and `declare module '*?raw'`.
3. Chunk per bullet / table row / numbered step. BM25 (k1 1.2, b 0.75). Boost own notes 1.45 / 1.3 / 1.2 / 1.15 (brain, architecture, ENV, lessons). Answer = top chunk cut at a boundary + source + "Also see".
4. Intents before search: `open|go to|show <tab>` navigates; `run <cmd>` sets `window.__rkPending`, navigates to Terminal and fires `rk-run`; "SOL price" and "latest launches" fetch live data.
5. Lazy-load it (`React.lazy`) and mount only after `mounted`. Build the index only when the panel opens.
6. It is NOT an LLM. If the owner wants one, ask for the key (see `docs/BRAIN-UPGRADE.md`) and stop until given.

### R2.4 Localhost preview (`LocalPreview.tsx`)
Shown under the terminal. Before `npm run dev`: a dashed placeholder with a "Run the whole setup for me" button. After: a browser frame (reload, address `localhost:3200/<path>`, page tabs) with Home, Explore, Launch (dry run, 70/30 slider), Agents, Leaderboard, Routes (all 68 pages), Talk (opens the helper). Label it as a preview built from public data. Keep `cwd` in a ref (lesson 38).

### R2.5 Images, video, README
1. Generate four extra scenes with the character lock + style lock (see `docs/IMAGE-PROMPTS.md`), retry any that return a 500, convert to JPG, save to `public/img/` and `docs/images/`. Look at them.
2. Record the tour: `BASE=http://localhost:3000 node tools/record-tour.mjs tour-raw`, then `ffmpeg -i tour-raw/*.webm -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart -an public/media/rakaza-tour.mp4`, a poster frame, and a 25 s GIF for the README.
3. Video tab: tour first, promo, scenes grid, songs, meme wall.
4. README: share card on top, GIF, a table with one scene image per feature, setup one-liner, doc map, honest limits.

### R2.6 Final verification (all must pass)
`npx tsc --noEmit` clean; `bun run build` clean; sloplint 0 FAIL; screenshots of Universe, Rakaza 3D (facing you, whole body visible), Terminal after "Run the whole setup" (localhost frame visible), Video, Market and the open helper chat, all looked at; `node tools/localhost-chat-smoke.mjs` has no `pageerror`; no `public/qa/` folder; `git grep -nE "ghp_[A-Za-z0-9]{20}|github_pat_|sk-[A-Za-z0-9]{20}"` finds nothing.
