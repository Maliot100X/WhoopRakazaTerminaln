# Every mistake made while building this, and the fix

Read this before building anything. Each item cost real time.

## Hosting and publishing

1. **Runtime is a Cloudflare Worker, not Node.** The full Rakaza terminal (Next.js 16, Solana wallet signing, Neon/Postgres, Telegram bot, Deepgram voice) cannot run there as is. This repo is a read-only front end over the public API of the real terminal. Do not try to port the server side without a plan and the keys.
2. **Do not iframe the Vercel terminal.** It sends `X-Frame-Options: DENY` and `frame-ancestors 'none'`. Link out instead.
3. **three.js touches `window`/WebGL, so it must be client-only.** The page is server-rendered. Gate 3D and fetch-heavy tabs behind a `mounted` flag (set in `useEffect`) and load them with `React.lazy`. See `src/components/Explorer.tsx`.
4. **Folders starting with `_` in `public/` are NOT served** (`/_qa/x.png` returned 404). Use `public/qa/`.
5. **A new publish takes 10 to 60 seconds to reach the public URL.** `whop-publish` says `published` first. Check the `x-whop-build` response header against `whop-publish status`, or poll the file with curl. Do not conclude "it's broken" after one 404.
6. **Never leave test files in `public/`.** Screenshots used for review went to `public/qa/` and were deleted before the final publish.
7. **`pkill -f vite` or `pkill -f "bun run dev"` kills your own shell** in the sandbox (exit 143) and the command after it never runs. Start the dev server with `nohup bun run dev > /tmp/dev.log 2>&1 &` and stop it with its PID, or just leave it.
8. **Do not hand-write `package.json`, `vite.config.ts` or `whop.app.json`.** They came from `whop apps init`. Edit them only through `bun add`.

## 3D avatar (VRM) bugs, in the order they appeared

9. **The avatar showed too low and cut off.** Cause 1: I framed the camera from `Box3.setFromObject(vrm.scene)`. For skinned meshes that bounding box is unreliable. Fix: frame from bone positions: head bone y + 0.28 at the top, lowest foot bone y - 0.03 at the bottom.
10. **The avatar was still too low.** Real cause: the idle animation did `hips.position.y = Math.sin(t) * 0.004 + hips.position.y * 0`, which zeroed the hips height every frame and sank her through the floor. Fix: store the rest height once (`restHips`) and animate around it.
11. **She faced away from the camera.** `VRMUtils.rotateVRM0(vrm)` rotates a VRM 0.x model 180 degrees on Y. My look-at-the-cursor code then did `vrm.scene.rotation.y = ...` every frame, erasing that rotation. Fix: add `vrm.scene` to a parent `pivot` group and rotate the pivot instead. `sample_b.vrm` is VRM 0.0 (check: `VRM.specVersion` is `0.0` in the file's JSON).
12. **Arms.** Rest pose uses `upperArm.rotation.z = +-1.28` on the normalized bones (left +, right -). Wave raises the right one by `+2.05` rad. Values are tuned on this one model.
13. **Buttons covered her feet** on phones. Keep the buttons in one row with a bottom gradient and frame with `frame.h * 1.55` so there is space for the speech bubble on top and buttons below.

## Universe (3D launches)

14. First camera was too close and the rings were cropped. Final: rings 4.2 / 6.4 / 8.6, camera z 16 desktop, 20 phones, y 4.
15. The gold coin looked dark red and green. Metalness without an environment map renders almost black. Use `metalness 0.3` plus an `emissive` colour.
16. Fog `FogExp2(..., 0.045)` erased far coins on phones. Use `0.012`.
17. Sprites that load images draw them to a canvas. Cross-origin images need `loader.setCrossOrigin('anonymous')` and a server that sends CORS (the Rakaza IPFS proxy does).

## React

18. **Terminal printed nothing in dev.** `useEffect(() => () => { alive.current = false }, [])` is wrong under React StrictMode (effect runs, cleans up, runs again, and the flag stays false). Fix: set `alive.current = true` inside the effect body.
19. Playwright: after pressing Enter in the terminal, wait 300 ms before waiting for the input to be enabled again, or the wait passes instantly because `busy` has not been set yet.

## Data and content

20. **The DexScreener "top boosted" list contains slurs and porn names.** Showing them raw on a public page is not acceptable. `src/components/Market.tsx` has a `BLOCK` regex. It is a word list, not a guarantee. Review it.
21. `GET /api/public/tokens/<mint>` times out on the live terminal. Do not build a detail view on it. Use the list payload, which already carries market and curve data.
22. `/api/health` has no CORS header. The terminal falls back to a labelled last-known answer.
23. The terminal's `curl localhost:3200/api/health` is a simulation. A browser tab cannot run `npm`. The screen says so. Do not remove that wording.

## Images and share cards

24. **Never ask an image model for text.** Generate the art without text (see `docs/IMAGE-PROMPTS.md`), then add the title with HTML + a real font and a headless screenshot (`tools/make-og.mjs`).
25. First card had the title at 128 px and it covered the coin and her hand. Final is 92 px at `left:56px; top:190px` with a left-to-right dark shade.
26. `generateImage` returns a signed URL that expires in 24 hours. Download it into `public/` right away. Do not hot-link it.
27. Share tags must be absolute https URLs: `og:image`, `twitter:image`, plus `twitter:card = summary_large_image`. They are in `src/routes/__root.tsx` and `src/routes/terminal.tsx`. A route's own `og:image` overrides the root one, so `src/routes/index.tsx` was changed too.
28. X caches link previews. For an old link use the X Card Validator or post a fresh URL.

## Reviewing 3D work (the thing that wasted the most time)

29. **I shipped 3D changes without ever seeing them**, then reported them as working. Do not do that. Install a headless browser (`bash scripts/qa-setup.sh`) and look. WebGL works headless with software GL: `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`.
30. Chromium headless on a fresh Debian 13 box fails with `libglib-2.0.so.0: cannot open shared object file`. `scripts/qa-setup.sh` installs the libraries (note `libasound2t64` on new releases, `libasound2` on old).
31. The image viewer tool only reads public http(s) URLs. In the Whop sandbox the trick is: save the screenshot to `public/qa/x.png`, publish, read it from the live URL, delete the folder, publish again.

## Skills and tools

32. `ui_ux_pro_max` `search.py --design-system` crashes (`persist_design_system` import error) in the `krishnakanthb13/antigravity_global_skills` copy. The `nextlevelbuilder/ui-ux-pro-max-skill` repo has a different `search.py`. Use the written guidance instead.
33. three.ws `forge_free` did not return in 100 s. `search_catalog` returned results immediately. Always set a `curl -m` timeout.
34. Most of the links in `docs/LINKS-AND-SOURCES.md` were never opened. Do not claim a skill was "used" if you only read a page about it.

## Security

35. **A GitHub personal access token was pasted into a chat to create this repo.** It must be revoked and replaced (GitHub > Settings > Developer settings > Personal access tokens). The token was only used for `git push` and the repo-creation API call and is not stored in any file in this repo.

## Round 2 (chatbot, localhost preview, video, images, lint)

36. **`THREE.Clock` is deprecated in three r186.** The console printed "THREE.Clock: This module has been deprecated. Please use THREE.Timer". Found again in the cloudai-x/threejs-skills. Use `const timer = new THREE.Timer(); timer.update(); timer.getDelta(); timer.getElapsed()`.
37. **An endless animation makes Playwright clicks time out** ("element is not stable"): the floating chat button bobs forever. In tests click it with `{ force: true }`. Keep the bob subtle and disabled for reduced motion.
38. **React state is stale inside an async chain.** The terminal's "Run the whole setup" runs five commands in a row; `cwd` kept its old value so `npm install` said "no package.json". Keep `cwd` in a ref (`st.current.cwd`) and mirror it to state for display.
39. **Two triggers, one command.** The helper chat can run a terminal command via a window event and also via a pending-command variable (for when the Terminal tab is not mounted yet). Dedupe: ignore the same command within 1.5 s.
40. **Helper search quality.** Chunking whole sections gave useless answers ("What this app is" for a 70/30 question). Chunk per bullet / table row / numbered step, boost the project's own notes over the copied docs, cut answers at a sentence or line boundary, show the source.
41. **Importing markdown as text:** `import x from './file.md?raw'` works in Vite; add `declare module '*?raw'` in `src/raw.d.ts` for TypeScript.
42. **`generateImage` can return a 500** (OpenAI server error) for one of four parallel calls. Just retry that one call. Images come back as ~1.5 to 2 MB PNGs: convert to JPG (84%) for the site.
43. **No ImageMagick/ffmpeg in the sandbox at first.** PNG to JPG was done with Chromium: `page.goto('file:///x.png')` then screenshot as JPEG. (`page.setContent` with a `file://` image does NOT load; `goto` does.) Do not delete the originals until you have checked the JPGs are different sizes (four identical 13,641-byte files meant they were all blank).
44. **ffmpeg installs fine with `apt-get install -y ffmpeg`** (as root). Playwright `recordVideo` writes WebM; convert to H.264 MP4 with `-pix_fmt yuv420p -movflags +faststart` so phones play it. A GIF for the README: `fps=8,scale=640:-1` with a palette.
45. **Recording WebGL headless works** with the SwiftShader flags but runs at a low frame rate. It is fine for a tour; it is not a benchmark.
46. **Hallmark sloplint** is plain Node, zero dependencies: `node scripts/sloplint.mjs <dir> --genre playful --scope app`. It reads Tailwind class strings, so `bg-[#hex]` and `shadow-[...rgba]` are "colour literals". Put colours in `@theme` tokens and use the utility names. Its "card nested in card" check fires on any `bg-card` inside a bordered container; use another surface token.
47. **Offensive third-party data.** A token feed can contain slurs. Keep the blocklist and consider a deny/allow-list approach for anything user-generated.
48. **Do not use `pkill -f vite`/`bun run dev` in the same shell command as a publish.** The shell dies (exit 143) and the next command never runs. Run the publish as its own command.
49. **`whop-publish status` can say `unpublished` while the new build is already serving.** Trust the `x-whop-build` response header of the live URL and a 200 on a new file.
