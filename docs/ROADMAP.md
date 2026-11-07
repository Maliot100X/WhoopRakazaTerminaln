# Not done yet (honest)

0. **A real LLM behind the helper.** Needs an API key from the owner. See BRAIN-UPGRADE.md. Also possible: run Graphify on this repo and feed the helper a knowledge graph.
0b. **Hallmark `sloplint --render`** (real-browser lint at 8 widths) and its fresh-context reviewer were not run.
0c. **GSAP / scroll-pinned scenes**, **Blender-made coin and avatar props**, **Huashu-style launch animation**: tools were cloned, not used.

1. **Real avatar animations from three.ws.** `search_catalog` returns `three-animation-clip-json` clips (e.g. "Big Wave", 4 s). They target a different skeleton, so they must be retargeted onto the VRM normalized bones. Not attempted. The wave today is hand-written bone rotations.
2. **Generated 3D models.** `forge_free` timed out. Try again with a long timeout, then swap the procedural gold coin in `Orbit3D.tsx` for the GLB.
3. **The rest of the Rakaza terminal:** games, diary, live show, studio, Talk (AI chat + voice), Telegram, vanity grinder, launching. They need server code and keys (River/AI key, Deepgram, SignalWire, Neon, Upstash, Helius). Port them only with those keys and a Worker-compatible design.
4. **Skills never opened:** see the "Not opened" rows in `docs/LINKS-AND-SOURCES.md`. skills.sh, X and Google were not searched.
5. **Landing page `/`** still has its first design. Rebuild it with the 3D look.
6. Token-name filter in Market is a simple word list.
7. Token detail view (price chart) is missing because the per-mint endpoint times out.
