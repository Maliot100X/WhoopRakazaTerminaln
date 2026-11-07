# Image prompts (consistent scenes)

Source of the style: `docs/reference/RakazaAiTerminal-PROMPT-GUIDE.md` and `...-PROMPTS.md` from the original repo. Follow them for every new image.

## Character lock (put this in every prompt)
Rakaza, a cheerful anime VTuber girl with a short violet-indigo bob haircut with hot-pink rim light, large violet eyes, a soft warm smile, a purple gaming headset and a dark indigo tech jacket with pink trim.

## Style lock
Flat vector-like illustration, clean thick outlines, deep indigo background `#170a36` with an electric-violet sunburst and halftone dots, mustard-yellow four-point sparkles, hot pink and mint accents. **No text, no letters, no watermark.**

## The share card (exact prompt used, 16:9, with `public/brand/banner.jpg` as the reference image)

> Wide 16:9 social share card for a Solana token launchpad. Rakaza, a cheerful anime VTuber girl with a short violet-indigo bob haircut with hot-pink rim light, large violet eyes, a soft warm smile, a purple gaming headset and a dark indigo tech jacket with pink trim, waving at the viewer on the right third. Flat vector-like illustration, clean thick outlines, deep indigo background #170a36 with an electric violet sunburst radiating from the left, halftone dots, mustard-yellow four-point sparkles, hot pink and mint accents. In the left two thirds, a floating glowing 3D-style gold coin with a rocket emblem orbited by three thin rings carrying small round token badges, and a dark indigo thick-outlined card with a hard pink offset shadow showing a donut chart. Large empty space on the left for a title. No text, no letters, no watermark.

Result is saved as `tools/_assets/bg.png` (1536x864).

## Adding the title (so the text is crisp)
```bash
bash scripts/qa-setup.sh          # once
node tools/make-og.mjs public/brand/og-terminal.jpg
```
Edit the words and sizes in `tools/og-template.html` (title 92 px Archivo Black, lavender `#e4d9ff`, pink `#ff4da6` offset shadow 7 px).

## More scenes (same recipe)
Use the table in the original PROMPT-GUIDE (gm, never-share, devnet-first, read-the-chart, dyor, 3am, keep-100, seventy-thirty). Final prompt = character lock + style lock + one scene sentence. The 8 memes in `public/memes/` come from there.
