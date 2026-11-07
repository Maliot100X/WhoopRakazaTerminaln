import { useEffect, useMemo, useRef, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import brain from '../brain/brain.md?raw'
import architecture from '../brain/architecture.md?raw'
import lessons from '../brain/lessons.md?raw'
import envDoc from '../brain/original/ENV.md?raw'
import deployDoc from '../brain/original/DEPLOY.md?raw'
import setupDoc from '../brain/original/AI-SETUP-GUIDE.md?raw'
import linksDoc from '../brain/original/LINKS-AND-TOOLS.md?raw'
import marketDoc from '../brain/original/MARKET-MAP.md?raw'
import routes from '../data/routes.json'

type Chunk = { id: string; src: string; head: string; text: string; tf: Map<string, number>; len: number }
type Msg = { who: 'me' | 'bot'; text: string; src?: string }
export type TabId = 'orbit' | 'avatar' | 'terminal' | 'media' | 'market' | 'launches' | 'agents' | 'community' | 'board' | 'about'

const STOP = new Set('the a an and or of to in on for with is are was be it this that how do i you me my can what why where when which from as at by if so not no your our we they them there then than into about just'.split(' '))
const tok = (s: string) => s.toLowerCase().replace(/[^a-z0-9_./-]+/g, ' ').split(' ').filter((w) => w.length > 1 && !STOP.has(w))

function chunkDoc(src: string, md: string): Omit<Chunk, 'tf' | 'len' | 'id'>[] {
  // One unit per bullet, table row, numbered step or paragraph. Indented lines continue the previous unit.
  const out: Omit<Chunk, 'tf' | 'len' | 'id'>[] = []
  let head = src
  let cur: string[] = []
  const flush = () => {
    const t = cur.join('\n').trim()
    if (t.length > 25) out.push({ src, head, text: t.slice(0, 900) })
    cur = []
  }
  for (const line of md.split('\n')) {
    if (/^#{1,4}\s/.test(line)) { flush(); head = line.replace(/^#+\s*/, '').slice(0, 80); continue }
    if (/^[0-9]+\.\s[A-Z][A-Z0-9 ()>/-]{5,}$/.test(line)) { flush(); head = line.slice(0, 80); continue }
    if (/^-{10,}$|^={10,}$|^\|[-| :]+\|$/.test(line)) { flush(); continue }
    if (!line.trim()) { flush(); continue }
    if (/^\s+\S/.test(line) && cur.length) { cur.push(line); continue }
    if (/^(- |\* |\| |[0-9]+[.)] |E[0-9]+\s)/.test(line)) flush()
    cur.push(line)
  }
  flush()
  return out
}

function buildIndex(): { chunks: Chunk[]; df: Map<string, number>; avg: number } {
  const raw = [
    ...chunkDoc('brain.md', brain), ...chunkDoc('architecture.md', architecture), ...chunkDoc('lessons.md', lessons),
    ...chunkDoc('original ENV.md', envDoc), ...chunkDoc('original DEPLOY.md', deployDoc), ...chunkDoc('original AI-SETUP-GUIDE', setupDoc),
    ...chunkDoc('original LINKS-AND-TOOLS', linksDoc), ...chunkDoc('original MARKET-MAP.md', marketDoc),
    ...(routes as { path: string; title: string; group: string; access: string; phase: number; blurb: string }[]).map((r) => ({ src: 'original routes', head: `Route ${r.path}`, text: `Route ${r.path} (${r.title}, group ${r.group}, access ${r.access}, built in phase ${r.phase}): ${r.blurb}` })),
  ]
  const df = new Map<string, number>()
  const chunks = raw.map((c, i) => {
    const words = tok(c.head + ' ' + c.head + ' ' + c.text)
    const tf = new Map<string, number>()
    words.forEach((w) => tf.set(w, (tf.get(w) ?? 0) + 1))
    tf.forEach((_, w) => df.set(w, (df.get(w) ?? 0) + 1))
    return { ...c, id: String(i), tf, len: words.length }
  })
  return { chunks, df, avg: chunks.reduce((a, c) => a + c.len, 0) / Math.max(1, chunks.length) }
}

function search(idx: ReturnType<typeof buildIndex>, q: string, k = 3) {
  const terms = tok(q)
  const N = idx.chunks.length
  return idx.chunks.map((c) => {
    let s = 0
    for (const t of terms) {
      const f = c.tf.get(t) ?? 0
      if (!f) continue
      const n = idx.df.get(t) ?? 0
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5))
      s += idf * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (c.len / idx.avg))))
    }
    const boost = c.src === 'brain.md' ? 1.45 : c.src === 'architecture.md' ? 1.3 : c.src === 'original ENV.md' ? 1.2 : c.src === 'lessons.md' ? 1.15 : 1
    return { c, s: s * boost }
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, k)
}

const NAV: [RegExp, TabId, string][] = [
  [/universe|orbit|galaxy/, 'orbit', 'Universe'], [/avatar|3d rakaza|rakaza 3d|vrm|model/, 'avatar', 'Rakaza 3D'], [/terminal|shell|cmd|command line|localhost/, 'terminal', 'Terminal'],
  [/video|promo|songs?|memes?|tour/, 'media', 'Video'], [/market|trending|dexscreener/, 'market', 'Market'], [/launches|launch list|tokens list/, 'launches', 'Launches'],
  [/agents?/, 'agents', 'Agents'], [/community|posts?/, 'community', 'Community'], [/leaderboard|ranking/, 'board', 'Leaderboard'], [/about/, 'about', 'About'],
]
const SUGGEST = ['What can I do here?', 'How do I run the real project?', 'How do I add a tab?', 'What is the 70/30 split?', 'Show me the SOL price', 'Run rakaza tokens']

export function Chatbot({ onNavigate }: { onNavigate: (t: TabId) => void }) {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([{ who: 'bot', text: "Hi, I'm Rakaza's helper. I know this whole project: the tabs, the terminal, setup, how to change things and the original terminal's docs. Ask me anything, or tell me to open a tab or run a command." }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const idx = useMemo(() => (open ? buildIndex() : null), [open])
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [msgs, open])
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [])

  useEffect(() => { const o = () => setOpen(true); window.addEventListener('rk-open-chat', o); return () => window.removeEventListener('rk-open-chat', o) }, [])
  const say = (m: Msg) => setMsgs((x) => [...x, m])

  async function ask(raw: string) {
    const q = raw.trim()
    if (!q || busy) return
    say({ who: 'me', text: q }); setInput(''); setBusy(true)
    try {
      const low = q.toLowerCase()
      const run = /^(run|execute|type)\s+(.+)/i.exec(q)
      if (run) {
        const cmd = run[2].replace(/^`|`$/g, '').trim()
        ;(window as unknown as { __rkPending?: string }).__rkPending = cmd
        onNavigate('terminal'); setTimeout(() => window.dispatchEvent(new CustomEvent('rk-run', { detail: cmd })), 400)
        say({ who: 'bot', text: `Opened the Terminal and ran: ${cmd}` })
      } else if (/^(hi|hello|hey|gm|yo)\b/.test(low)) say({ who: 'bot', text: 'gm. What do you want to do: open a tab, run a command, or learn how something works?' })
      else if (/(sol|solana).*(price)|price of (sol|solana)|show me the sol/.test(low)) {
        const d = await (await fetch('https://api.dexscreener.com/tokens/v1/solana/So11111111111111111111111111111111111111112')).json()
        say({ who: 'bot', text: `SOL is $${Number(d[0].priceUsd).toFixed(2)} (${d[0].priceChange?.h24 >= 0 ? '+' : ''}${d[0].priceChange?.h24}% in 24h). Live from DexScreener. Not financial advice.`, src: 'live data' })
      } else if (/(latest|current|how many|list|show).*(launch|token)/.test(low) && !/how (do|to)/.test(low)) {
        const d = await (await fetch('https://rakaza-ai-terminal.vercel.app/api/public/tokens')).json()
        say({ who: 'bot', text: `${d.count} launches on ${d.network}. Newest: ${d.tokens.slice(0, 4).map((t: { symbol: string; name: string }) => `$${t.symbol} (${t.name})`).join(', ')}. Open the Universe tab to fly through them.`, src: 'live data' })
      } else {
        const go = /^(open|go to|show|take me to|switch to)\b/.test(low) ? NAV.find(([re]) => re.test(low)) : undefined
        if (go) { onNavigate(go[1]); say({ who: 'bot', text: `Opened ${go[2]}.` }) }
        else if (idx) {
          const hits = search(idx, q)
          if (!hits.length || hits[0].s < 1.2) say({ who: 'bot', text: "I don't have that in my notes. I only answer from this project’s files, and I won't guess. Try asking about a tab, the terminal commands, setup, a recipe like adding a tab, or an error you hit." })
          else {
            const top = hits[0].c
            const clean = top.text.replace(/\n{2,}/g, '\n').replace(/^-{5,}\s*$/gm, '').trim()
            let cut = clean.slice(0, 680)
            if (clean.length > 680) { const k = Math.max(cut.lastIndexOf('\n'), cut.lastIndexOf('. ')); cut = (k > 300 ? cut.slice(0, k + 1) : cut) + ' ...' }
            const more = hits.slice(1, 3).map((h) => `${h.c.src} > ${h.c.head}`)
            say({ who: 'bot', text: cut, src: `${top.src} > ${top.head}${more.length ? `. Also see: ${more.join(' | ')}` : ''}` })
          }
        }
      }
    } catch (e) { say({ who: 'bot', text: `That live lookup failed (${(e as Error).message}). Try again in a moment.` }) }
    setBusy(false)
  }

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} aria-label="Open Rakaza helper chat" className="rk-fab fixed right-4 bottom-4 z-40 grid size-16 place-items-center overflow-hidden rounded-full border-2 border-ink bg-accent shadow-[4px_4px_0_var(--color-pink)]">
          <img src="/brand/profile-320.jpg" alt="" className="size-full object-cover" />
          <span className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-mint text-accent-ink"><MessageCircle className="size-3.5" aria-hidden /></span>
        </button>
      )}
      {open && (
        <section role="dialog" aria-label="Rakaza helper chat" className="rk-pop fixed inset-x-3 bottom-3 z-50 flex max-h-[78vh] flex-col overflow-hidden rounded-card border-2 border-ink bg-card shadow-[6px_6px_0_var(--color-pink)] sm:inset-x-auto sm:right-4 sm:w-[400px]">
          <header className="flex items-center gap-3 border-b-2 border-line px-4 py-3">
            <img src="/brand/profile-320.jpg" alt="" className="size-10 rounded-full border-2 border-ink object-cover" />
            <div className="min-w-0 flex-1"><p className="font-bold">Rakaza helper</p><p className="text-xs text-muted">Answers from this project’s own notes</p></div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="grid size-10 place-items-center rounded-full border-2 border-line"><X className="size-4" /></button>
          </header>
          <div className="flex-1 space-y-3 overflow-auto px-4 py-3">
            {msgs.map((m, i) => (
              <div key={i} className={m.who === 'me' ? 'flex justify-end' : 'flex'}>
                <div className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.who === 'me' ? 'bg-accent text-accent-ink' : 'border border-line bg-paper'}`}>
                  {m.text}
                  {m.src && <p className="mt-2 text-xs text-muted">Source: {m.src}</p>}
                </div>
              </div>
            ))}
            {busy && <p className="text-sm text-muted">Looking it up…</p>}
            <div ref={end} />
          </div>
          <div className="flex gap-2 overflow-x-auto px-4 pb-2">
            {SUGGEST.map((s) => <button key={s} onClick={() => ask(s)} className="min-h-9 shrink-0 rounded-full border border-line px-3 text-xs hover:border-ink">{s}</button>)}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); void ask(input) }} className="flex gap-2 border-t-2 border-line p-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask, or say: open the terminal" aria-label="Message" className="min-h-11 min-w-0 flex-1 rounded-full border-2 border-line bg-paper px-4 text-sm outline-none focus:border-ink" />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="grid size-11 place-items-center rounded-full border-2 border-ink bg-accent text-accent-ink disabled:opacity-50"><Send className="size-4" /></button>
          </form>
        </section>
      )}
    </>
  )
}
