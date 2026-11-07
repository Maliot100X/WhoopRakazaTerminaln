// Converts every .png in a folder to .jpg (quality 84) using a real browser, since the sandbox had no ImageMagick.
// Usage: node tools/png-to-jpg.mjs /absolute/path/to/folder
import { chromium } from 'playwright'
import fs from 'node:fs'
const dir = process.argv[2]
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1536, height: 864 } })
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.png'))) {
  await p.goto(`file://${dir}/${f}`)
  await p.screenshot({ path: `${dir}/${f.replace('.png', '.jpg')}`, type: 'jpeg', quality: 84 })
}
await b.close()
