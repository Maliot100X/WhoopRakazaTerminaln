# DESIGN.md: Rakaza Terminal

Nine-section format from VoltAgent/awesome-design-md (the Google Stitch DESIGN.md idea). Give this file to a coding agent and say "build me a page that follows DESIGN.md". Values match `src/styles.css`.

## 1. Visual theme and atmosphere
Loud, playful neo-brutalist on a deep indigo night sky. A cheerful anime VTuber (Rakaza) is the mascot. Thick outlines, hard pink offset shadows, mustard and mint accents, 3D coins and an avatar as the stars of the page. Density: medium. Phones come first.
Genre (Hallmark): playful. Motion archetype (LottieFiles): Playful, 150 to 300 ms, ease-out-back for pop-ins.

## 2. Colour palette and roles
| Name | Hex | Role |
|---|---|---|
| paper | `#120828` | page background |
| night | `#0a0418` | terminal background |
| card | `#1c0f40` | cards, panels |
| ink | `#f4efff` | body text |
| lav | `#e4d9ff` | display titles |
| muted | `#b7aad6` | secondary text |
| line | `#4a3a86` | borders |
| accent (mustard) | `#ffc933` | primary action, active tab, highlights |
| accent-ink | `#170a36` | text on accent |
| pink | `#ff4da6` | offset shadows, errors, price down |
| mint | `#3ff0c3` | success, price up, focus ring |
| violet | `#6a3cff` | hero and avatar stage glow |

## 3. Typography rules
Three families only: Anybody (display, 800 to 900), Geist (body), Geist Mono (code and the terminal).
| Role | Font | Size | Weight |
|---|---|---|---|
| Page title | Anybody | 48 / 72 px (phone / desktop), uppercase, pink 4 px offset shadow | 900 |
| Section title | Anybody | 30 px | 900 |
| Body | Geist | 16 px, line 1.6 | 400 |
| Small label | Geist | 12 to 14 px, sentence case, no tracking | 500 |
| Terminal | Geist Mono | 13 px | 400 |
No tracked uppercase eyebrow labels. No one-coloured word in a headline. No gradient text.

## 4. Component stylings
- Tab pill: min 44 px tall, 2 px border `line`; active = accent fill, `accent-ink` text.
- Primary button: accent fill, 2 px `ink` border, full round. Press: scale 0.96 in 140 ms.
- Card: `card` fill, 2 px `line` border, radius 1.25 rem, hard offset shadow only on hero-level cards (pink or mint).
- Terminal: `night` fill, mono, accent-coloured prompt, command chips below.
- Chat bubble: user = accent fill; bot = `paper` fill with `line` border; always shows its source.
- Focus: 3 px mint outline, offset 3 px, instant. Hover under 100 ms.

## 5. Layout principles
One container, max 56 rem, 20 px side padding on phones. Tabs scroll horizontally. 3D panels are 68 to 72 vh, never taller than 760 px. No horizontal page scroll (`overflow-x: clip` on html and body).

## 6. Depth and elevation
Flat surfaces. Elevation is a hard offset shadow (4 to 8 px, pink or mint) on key cards, never blur. No glass panels. The 3D scenes carry the depth.

## 7. Do's and don'ts
Do: use tokens, real data, short sentences, source every helper answer, label simulations as simulations.
Don't: invent metrics or testimonials, show slur or porn token names, use emoji as icons, nest cards inside cards, animate width/height/top/left, use `transition: all`, hide focus.

## 8. Responsive behaviour
Designed at 390 x 844 first, checked at 1280 x 800. The Rakaza avatar frames from bone positions, so it fits any aspect. The Universe camera pulls back on narrow screens (z 20 vs 16).

## 9. Agent prompt guide
"Build a new tab for Rakaza Terminal. Follow DESIGN.md exactly: indigo paper background, card surfaces with 2 px line borders, accent mustard primary button, Anybody for the title and Geist for text, no glass, no gradient text, playful motion (320 ms ease-out-back pop-in, 90 ms hover). Use real data from the public API, never invented numbers. Check it in a real browser at 390 px and 1280 px before saying it is done."
