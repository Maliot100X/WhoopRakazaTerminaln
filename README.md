# WhoopRakazaTerminaln

A Whop-hosted, mobile-first 3D front end for the **Rakaza AI Terminal** (Solana pump.fun launchpad with an AI character).
Live: https://rakazaiterminal.whop.site/terminal  ·  Original project: https://github.com/Maliot100X/RakazaAiTerminal  ·  Full terminal: https://rakaza-ai-terminal.vercel.app

![share card](tools/_assets/bg.png)

## What is in it
| Tab | What you get |
|---|---|
| **Universe** | Live launches as coins orbiting a gold "R" coin in 3D. Tap one for details. Ring = bonding-curve progress, green glow = graduated. |
| **Rakaza 3D** | A live 3D VRM avatar that faces you, blinks, waves, talks (typed bubble + mouth movement + optional voice) and quotes the live SOL price. |
| **Terminal** | Try-it shell: `git clone`, `npm install`, `npm run dev`, `curl localhost:3200/api/health`, `rakaza tokens`, `launch --name ... --symbol ...` (dry run), `theme`. **Install/dev are simulated; data commands are real.** |
| **Video** | 15 s promo, two songs with equalizer, meme wall. |
| **Market** | Live SOL price and trending Solana tokens (filtered for offensive names). |
| **Launches / Agents / Community / Leaderboard / About** | Live data from the Rakaza public API. |

It is read-only: no wallet, no signing, no keys, no server code.

## One-command setup
```bash
curl -fsSL https://raw.githubusercontent.com/Maliot100X/WhoopRakazaTerminaln/main/scripts/setup.sh | bash
```
Then `npm run dev` and open http://localhost:3000/terminal. Details: [docs/SETUP.md](docs/SETUP.md).

## Read these (in this order if you are about to build or fix something)
1. [docs/LESSONS-AND-FIXES.md](docs/LESSONS-AND-FIXES.md): every mistake and its fix, so you skip them
2. [docs/AGENT-BUILD.md](docs/AGENT-BUILD.md): the full agent prompt, including a one-click prompt for the Whop AI
3. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): files, stack, design tokens
4. [docs/LINKS-AND-SOURCES.md](docs/LINKS-AND-SOURCES.md): every link given, and honestly which were opened, used or skipped
5. [docs/IMAGE-PROMPTS.md](docs/IMAGE-PROMPTS.md): consistent image prompts and the share-card recipe
6. [docs/DEPLOY-TO-WHOP.md](docs/DEPLOY-TO-WHOP.md): publishing and checking the share card
7. [docs/ROADMAP.md](docs/ROADMAP.md): what is not done

## Honest limits
The full Rakaza terminal cannot run on Whop hosting (it needs Solana signing, a database, Telegram, voice and keys). This project shows its live public data in 3D and links out for everything else. The three.ws generation endpoint and several listed skills were not used; see the links file.

## Credits and licences
Avatar: VRoid Project AvatarSample_B (commercial use allowed, no credit needed). Brand images, promo video, songs and memes: from Maliot100X/RakazaAiTerminal. Skill files in `docs/reference/` are copies kept for reference under their own licences (MIT / Apache-2.0): agentic-awesome-skills, three.ws, antigravity_global_skills. Fonts in `tools/_assets/`: SIL Open Font License.
