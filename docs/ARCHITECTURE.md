# Architecture

```
Browser ──► whop.site (Cloudflare Worker, TanStack Start SSR)
              │  serves HTML with <head> share tags + static files from public/
              ▼
        React 19 app (client)
              │  fetch() straight from the browser (CORS open)
              ├──► rakaza-ai-terminal.vercel.app/api/public/*   launches, agents, leaderboard, community
              └──► api.dexscreener.com                          Solana price + trending
```
No server code of our own. No secrets. No database. Everything dynamic is a browser `fetch`.

## Stack (exact versions in `package.json`)
TanStack Start 1.169 + TanStack Router 1.170 (file routes), React 19, Vite 8, Tailwind 4 (`@theme` tokens in `src/styles.css`), three 0.186.1, @pixiv/three-vrm 3.5.5, lucide-react. Built by the `whop()` Vite plugin from `@whop/cli` and the Cloudflare Vite plugin. `wrangler.jsonc` has `nodejs_compat`.

## Files
| File | Job |
|---|---|
| `src/routes/__root.tsx` | HTML shell, fonts (Anybody, Geist, Geist Mono, Instrument Serif), **global share tags** |
| `src/routes/index.tsx` | Landing page (`/`), links to `/terminal` |
| `src/routes/terminal.tsx` | The 3D app (`/terminal`) with its own title and share tags. **The URL to share.** |
| `src/routes/experiences/$experienceId.tsx` | Same app, for when the Whop dashboard opens it as an app |
| `src/components/Explorer.tsx` | Header, parallax banner, tab bar, Launches/Agents/Leaderboard/About, token sheet, shared fetch hook `useApi` |
| `src/components/Orbit3D.tsx` | Universe. Raw three.js: star field, gold "R" coin, 3 rings, token badge sprites with progress rings, halo for graduated coins, shooting stars, raycaster click, pointer parallax |
| `src/components/Avatar3D.tsx` | Rakaza 3D. GLTFLoader + VRMLoaderPlugin, bone-based framing, look-at, blink, breathe, wave, mouth movement while "talking", typed speech bubble, speechSynthesis voice, live SOL price line |
| `src/components/Terminal.tsx` | Demo shell. Simulated install/dev, real data commands, dry-run launch, themes |
| `src/components/Media.tsx` | Promo video, 2 songs with equalizer, meme wall + lightbox |
| `src/components/Community.tsx` | Live community feed |
| `src/components/Market.tsx` | DexScreener trending + SOL price, with the name filter |
| `src/components/Reveal.tsx` | Scroll-in animation wrapper (IntersectionObserver) |
| `src/components/Chatbot.tsx` | Floating helper. BM25 search over `src/brain/*` (+ the original terminal's docs and 68-route map), intents: open tab, run terminal command, live SOL price, latest launches. Cites its source. Not an LLM, see BRAIN-UPGRADE.md |
| `src/components/LocalPreview.tsx` | The "localhost:3200" browser frame under the Terminal: Home, Explore, Launch (dry run), Agents, Leaderboard, Routes (all 68 real pages), Talk |
| `src/brain/brain.md` | The helper's identity rules and knowledge (edit this to teach it). `original/` holds copies of the original repo's ENV, DEPLOY, AI-SETUP-GUIDE, LINKS, MARKET-MAP |
| `src/data/routes.json` | The original terminal's 68 routes with blurbs |
| `DESIGN.md` | This app's design system in the nine-section DESIGN.md format |
| `public/brand/` | banner, profile, `rakaza.vrm` (VRoid AvatarSample_B, free for commercial use, no credit needed), `og-terminal.jpg` (share card) |
| `public/media/`, `public/memes/` | promo video + poster, songs, meme images (copied from the original repo) |
| `tools/` | headless-browser screenshot, terminal smoke test, share-card renderer |
| `docs/reference/` | the skill files and prompt guide that informed the build (copies, with their licences) |

## Design system (from the brand, not invented)
Mood: loud, playful, neo-brutalist. Fonts: Anybody (display), Geist (body), Geist Mono. Tokens in `src/styles.css`: paper `#120828`, card `#1c0f40`, ink `#f4efff`, muted `#b7aad6`, line `#4a3a86`, accent `#ffc933`, pink `#ff4da6`, mint `#3ff0c3`. Thick borders and hard offset shadows on cards. Motion: `rise` keyframe on tab change, `Reveal` on scroll, parallax banner, all disabled under `prefers-reduced-motion`.

## Tabs
Universe, Rakaza 3D, Terminal (+ localhost preview), Video (tour, promo, scenes, songs, memes), Market, Launches, Agents, Community, Leaderboard, About. The helper chat floats over all of them. Tab state is React state; add a tab in three places in `Explorer.tsx`: the lazy import, the `tabs` array, the render switch.

## Hard limits
- Read-only. It cannot launch, trade, sign or chat with the AI. Those need the full terminal (wallet signing, keys).
- Public data only. If the Vercel terminal changes its API, the tabs show a retry state.
