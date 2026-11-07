// Runs the whole demo-terminal flow in a real browser and prints the transcript.
// Usage: BASE=http://localhost:3000 node tools/terminal-smoke.mjs
import { chromium } from 'playwright'
const BASE = process.env.BASE || 'http://localhost:3000'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 } })
p.on('pageerror', (e) => console.log('pageerror', e.message))
await p.goto(BASE + '/terminal', { waitUntil: 'networkidle' })
await p.getByRole('button', { name: 'Terminal' }).click()
const cmds = ['git clone https://github.com/Maliot100X/RakazaAiTerminal', 'cd RakazaAiTerminal', 'npm install', 'cp .env.example .env.local', 'npm run dev', 'curl localhost:3200/api/health', 'rakaza tokens', 'launch --name "Moon Cat" --symbol MCAT']
for (const c of cmds) {
  await p.fill('#rk-in', c)
  await p.press('#rk-in', 'Enter')
  await p.waitForTimeout(300) // let busy=true land, otherwise the next wait passes instantly
  await p.waitForFunction(() => !document.getElementById('rk-in').disabled, { timeout: 30000 })
}
console.log(await p.locator('.font-mono.text-\\[13px\\]').innerText())
await b.close()
