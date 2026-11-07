// Renders tools/og-template.html to a 1200x630 JPEG share card.
// Needs tools/_assets/bg.png (the generated artwork), ab.ttf and gm.ttf (see docs/IMAGE-PROMPTS.md).
// Usage: node tools/make-og.mjs public/brand/og-terminal.jpg
import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const out = path.resolve(process.argv[2] ?? 'public/brand/og-terminal.jpg')
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1200, height: 630 } })
await p.goto('file://' + path.join(here, 'og-template.html'))
await p.waitForTimeout(800) // let the local fonts load before the screenshot
await p.screenshot({ path: out, type: 'jpeg', quality: 88 })
await b.close()
console.log('wrote', out)
