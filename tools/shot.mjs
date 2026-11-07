// Screenshot a tab of the running site with a real WebGL context (software GL, so it works headless).
// Usage: node tools/shot.mjs <url> "<Tab label or empty>" <out.png> [width] [height]
// Example: node tools/shot.mjs http://localhost:3000/terminal "Rakaza 3D" shot.png 390 844
import { chromium } from 'playwright'
const [, , url, tab, out, w = '390', h = '844'] = process.argv
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 })
p.on('console', (m) => { if (['error', 'warning'].includes(m.type()) && !/THREE.Clock/.test(m.text())) console.log('console', m.type(), m.text().slice(0, 200)) })
p.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 300)))
await p.goto(url, { waitUntil: 'networkidle' })
if (tab) await p.getByRole('button', { name: tab }).click()
await p.waitForTimeout(+(process.env.WAIT || 9000)) // VRM is 4 MB, give it time
await p.screenshot({ path: out, fullPage: true })
await b.close()
