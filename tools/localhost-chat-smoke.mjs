import { chromium } from 'playwright'
const out = process.env.OUT || 'qa-out'
import fs from 'node:fs'; fs.mkdirSync(out, { recursive: true })
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:390,height:844} })
p.on('pageerror', e => console.log('pageerror', e.message.slice(0,200)))
p.on('console', m => { if (m.type()==='error') console.log('console.error', m.text().slice(0,160)) })
await p.goto('' + (process.env.BASE || 'http://localhost:3000') + '/terminal',{waitUntil:'networkidle'})
await p.getByRole('button',{name:'Terminal'}).click()
await p.getByRole('button',{name:'Run the whole setup for me'}).first().click()
await p.waitForFunction(()=>document.body.innerText.includes('localhost:3200/'),{timeout:60000})
await p.waitForTimeout(3500)
await p.screenshot({ path: out+'/lp1.png', fullPage:true })
await p.getByRole('button',{name:'Launch',exact:true}).last().click(); await p.waitForTimeout(500)
await p.getByRole('button',{name:'Preview launch (dry run)'}).click(); await p.waitForTimeout(300)
await p.getByRole('button',{name:'Routes',exact:true}).click(); await p.waitForTimeout(500)
await p.screenshot({ path: out+'/lp2.png', fullPage:true })
// chatbot
await p.getByRole('button',{name:'Open Rakaza helper chat'}).click({force:true})
for (const q of ['How do I add a tab?','what are the env variables for helius','Run rakaza price','what is the 70/30 split']) {
  await p.fill('input[aria-label="Message"]', q); await p.press('input[aria-label="Message"]','Enter'); await p.waitForTimeout(1800)
}
await p.screenshot({ path: out+'/chat1.png', fullPage:false })
console.log((await p.locator('section[role=dialog]').innerText()).slice(0,2200))
await b.close()
