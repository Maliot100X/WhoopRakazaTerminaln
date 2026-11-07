# Every link and source you gave, and exactly what happened with each

Honest status. "Opened and used" means I fetched the real file and it changed what I built. "Read" means I read it but only took ideas.
"Not opened" means I never opened it. Nothing here is padded.

## Your project

| # | Link / file | What it is | Status |
|---|---|---|---|
| 1 | `RakazaAiTerminal-main (1).zip` (attached) | Source of the full terminal | Unzipped and inspected. Next.js 16, Solana, Neon, Upstash, Deepgram, SignalWire, three-vrm. Assets copied out: VRM avatar, brand images, promo video, 2 songs, 8 memes. |
| 2 | https://github.com/Maliot100X/RakazaAiTerminal | Same project on GitHub | Used as the target of the demo terminal's `git clone` and as the link on every page. |
| 3 | https://rakaza-ai-terminal.vercel.app/ | The live terminal ("playground") | Probed with curl. Its public API (`/api/public/...`) allows browser calls (CORS `*`) and feeds the Universe, Launches, Agents, Leaderboard, Community tabs. It sends `X-Frame-Options: DENY` and `frame-ancestors 'none'`, so it can NOT be embedded in an iframe. |
| 4 | https://github.com/Maliot100X/grokbot-x-launch-kit | Your other repo (named in your profile text) | Not opened. Only its one-line description was in your message. |

## Skills and tools you listed

| # | Link | Status |
|---|---|---|
| 5 | https://github.com/sickn33/agentic-awesome-skills/blob/main/skills/antigravity-design-expert/SKILL.md | Opened and used. Cloned the whole repo (2,853 skills). Ideas applied: glass panels, depth, staggered entrances, reduced-motion, no continuous box-shadow animation. Copy in `docs/reference/skills/`. |
| 6 | Same repo, `3d-web-experience` skill | Opened and used (found by listing the cloned repo). Ideas applied: client-only 3D, lazy loading, fallbacks, performance. |
| 7 | Same repo, `anti-slop-design` skill | Opened and used for the Market tab and general polish (no vanity stats, real data only, interactive states). |
| 8 | https://github.com/nirholas/three.ws/blob/main/.agents/skills/generate-3d-model/SKILL.md | Opened and used. I called its free endpoint `https://three.ws/api/mcp-studio` with `forge_free`. **It did not answer within 100 seconds**, so no generated model is in the app. Copy in `docs/reference/skills/`. |
| 9 | https://github.com/nirholas/three.ws (and `/docs/start-here.md`) | Cloned. Read the skills `create-3d-avatar`, `embed-three-ws-avatar`, `find-3d-assets`. `search_catalog` on the same endpoint WORKS (returned animation clip JSON for "wave"). **Not yet used in the app.** See ROADMAP. |
| 10 | https://github.com/krishnakanthb13/antigravity_global_skills/blob/main/ui_ux_pro_max/SKILL.md | Cloned and tried to run its design-system search. **It crashed**: `ImportError: cannot import name 'persist_design_system'`. Only its written guidance was used. |
| 11 | https://skillsllm.com/skill/ui-ux-pro-max-skill | Not opened. I cloned the upstream repo `nextlevelbuilder/ui-ux-pro-max-skill` instead; its `search.py` is a different tool (logo search) and has no `--design-system` flag. |
| 12 | https://skills-hub.ai/antigravity-skills | Not opened. |
| 13 | https://www.ui-skills.com/agents/antigravity | Not opened. |
| 14 | https://community.ibm.com/community/user/blogs/nich8/2026/07/16/threews-the-free-ai-3d-model-generators-10-best | Not opened. |
| 15 | https://skillsllm.com/skill/antigravity-skills | Not opened. |
| 16 | https://skillsllm.com/skill/open-3d-skills | Not opened. |
| 17 | https://skillsllm.com/skill/cinematic-ui | Not opened. |
| 18 | https://skillsllm.com/skill/system-prompts-leaks | Not opened. (Also not something to build from.) |
| 19 | skills.sh, X, Google ("search everywhere") | Not searched. |

## The result

| Link | What |
|---|---|
| https://rakazaiterminal.whop.site | Landing page |
| https://rakazaiterminal.whop.site/terminal | The 3D app (the link to share) |
| `/experiences/<id>` | Same app, used when added from the Whop dashboard |

## Public data sources the app calls from the browser (all verified)

| Source | Used for | CORS from browser |
|---|---|---|
| `https://rakaza-ai-terminal.vercel.app/api/public/tokens` | Universe, Launches, terminal `rakaza tokens` | yes (`*`) |
| `.../api/public/agents`, `.../leaderboard/launches`, `.../leaderboard/agents`, `.../community` | Agents, Leaderboard, Community | yes |
| `https://api.dexscreener.com/token-boosts/top/v1` and `/tokens/v1/solana/<mints>` | Market tab, SOL price on the avatar | yes (`*`) |
| `https://rakaza-ai-terminal.vercel.app/api/health` | terminal `rakaza health` | **no** (falls back to a labelled last-known answer) |
| `https://rakaza-ai-terminal.vercel.app/api/public/tokens/<mint>` | token detail | **times out** (`FUNCTION_INVOCATION_TIMEOUT`), so it is not used |
| `https://lite-api.jup.ag/price/v3` | SOL price | works with curl, no CORS header seen, so DexScreener is used instead |
| `https://three.ws/api/mcp-studio` | 3D catalog / generation | `search_catalog` works, `forge_free` timed out |

## Round 2 additions (your second list plus what the search found)

| Link | Status |
|---|---|
| https://github.com/rlaope/oh-my-hermes | Cloned (170 MB), README and install protocol read. It is an operating layer for the Hermes agent, so not applicable to this static app. Not run. |
| Graphify (github.com/Graphify-Labs/graphify) | Cloned. Not run (needs `pipx install graphifyy`). |
| Awesome DESIGN.md (github.com/VoltAgent/awesome-design-md) | Cloned (84 brands). Used the format: this repo has its own `DESIGN.md`. |
| Hallmark (github.com/Nutlope/hallmark) | Cloned and **run** (sloplint). See `docs/SKILLS-RESEARCH.md`. |
| Huashu Design (github.com/alchaincyf/huashu-design) | Cloned, SKILL.md read. Not run. |
| Designer Skills Pack (github.com/Owl-Listener/designer-skills) | Cloned. I counted 111 skills and 34 command files. Not run. |
| Motion Design Skill (github.com/LottieFiles/motion-design-skill) | Cloned and **applied** (motion tokens). |
| Blender skills (github.com/EL4CTEO/blender-skills) | Cloned (28 skills). Not run. |
| github.com/zanwei/design-dna, github.com/cloudai-x/threejs-skills, github.com/greensock/gsap-skills | Found in a Nov 3 2026 newsletter ("5 Claude Code skills that animate your site"). Cloned. three.js skills **applied** (Clock to Timer). |
| The X post text you pasted ("web designers have NO IDEA...") | Used as the research list. The X post itself was not opened. |
| skills.sh, Google, X, forums | Searched through a web search tool only (it returned GitHub pages, dev.to, newsletters, review sites). X and skills.sh were not browsed directly. |
