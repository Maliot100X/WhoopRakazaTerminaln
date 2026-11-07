import { useEffect, useRef, useState } from 'react'
import { ExternalLink, Globe, MessageCircle, RotateCw } from 'lucide-react'
import routes from '../data/routes.json'

const ORIGIN = 'https://rakaza-ai-terminal.vercel.app'
const API = `${ORIGIN}/api/public`
type R = { path: string; title: string; group: string; access: string; phase: number; blurb: string }
const ALL = routes as R[]
const PAGES = ['Home', 'Explore', 'Launch', 'Agents', 'Leaderboard', 'Routes', 'Talk'] as const
type Page = (typeof PAGES)[number]
const PATH: Record<Page, string> = { Home: '/', Explore: '/explore', Launch: '/launch', Agents: '/dash/agents', Leaderboard: '/leaderboard', Routes: '/docs', Talk: '/talk' }
const abs = (u?: string) => (!u ? undefined : u.startsWith('http') ? u : ORIGIN + u)

function useJson<T>(path: string) {
  const [d, setD] = useState<T | null>(null)
  const [e, setE] = useState<string | null>(null)
  useEffect(() => { let on = true; fetch(`${API}/${path}`).then((r) => r.json()).then((j) => on && setD(j)).catch((x) => on && setE(String(x.message || x))); return () => { on = false } }, [path])
  return { d, e }
}

function Home() {
  const { d } = useJson<{ tokens: { mint: string; symbol: string; image?: string; curve?: { progressPct: number } }[]; count: number; network: string }>('tokens')
  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border-2 border-line">
        <img src="/brand/banner.jpg" alt="Rakaza" className="h-40 w-full object-cover sm:h-52" />
      </div>
      <h3 className="mt-4 font-display text-2xl font-black">A character, not a chatbot.</h3>
      <p className="mt-1 text-sm text-muted">Launch coins on Solana with an AI character. Sponsored launches split 70/30. Self launches keep 100%.</p>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {d ? d.tokens.map((t) => (
          <div key={t.mint} className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-paper py-1 pr-3 pl-1">
            <img src={abs(t.image)} alt="" className="size-7 rounded-full bg-line object-cover" /><span className="text-xs font-bold">${t.symbol}</span>
            <span className="text-xs text-muted">{Math.round(t.curve?.progressPct ?? 0)}%</span>
          </div>
        )) : <p className="text-sm text-muted">Loading the ticker…</p>}
      </div>
      {d && <p className="text-xs text-muted">{d.count} launches on {d.network}</p>}
    </div>
  )
}

function Explore() {
  const { d, e } = useJson<{ tokens: { mint: string; name: string; symbol: string; image?: string; market?: { marketCapSol: number | null }; curve?: { progressPct: number }; links?: { page?: string } }[] }>('tokens')
  if (e) return <p className="text-sm text-muted">Couldn't load ({e}).</p>
  if (!d) return <p className="text-sm text-muted">Loading…</p>
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {d.tokens.map((t) => (
        <li key={t.mint} className="flex items-center gap-3 rounded-xl border-2 border-line bg-paper p-3">
          <img src={abs(t.image)} alt="" className="size-12 rounded-lg bg-line object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{t.name} <span className="font-mono text-xs text-muted">${t.symbol}</span></p>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full bg-accent" style={{ width: `${Math.min(100, t.curve?.progressPct ?? 0)}%` }} /></div>
            <p className="mt-1 text-xs text-muted">Market cap {t.market?.marketCapSol != null ? t.market.marketCapSol.toFixed(2) : 'n/a'} SOL</p>
          </div>
          {t.links?.page && <a href={t.links.page} target="_blank" rel="noreferrer" aria-label={`Open ${t.name} on the real terminal`} className="grid size-9 place-items-center rounded-full border border-line"><ExternalLink className="size-4" /></a>}
        </li>
      ))}
    </ul>
  )
}

function Launch() {
  const [name, setName] = useState('Moon Cat')
  const [sym, setSym] = useState('MCAT')
  const [mode, setMode] = useState<'sponsored' | 'self'>('sponsored')
  const [buy, setBuy] = useState(1)
  const [plan, setPlan] = useState<string[] | null>(null)
  const go = () => setPlan([`Validate "${name}" ($${sym.toUpperCase()})`, 'Upload image and description to IPFS', 'Build the pump.fun create instruction on devnet', mode === 'sponsored' ? `Fee split: ${(buy * 0.7).toFixed(2)} SOL to you, ${(buy * 0.3).toFixed(2)} SOL to the agent (on ${buy} SOL of fees)` : `Self launch: you keep 100%, one flat service fee applies`, 'DRY RUN finished. Nothing was sent. Use the real terminal and your own wallet to launch.'])
  return (
    <div className="grid gap-3 sm:max-w-md">
      <label className="grid gap-1 text-sm">Coin name<input value={name} onChange={(e) => setName(e.target.value)} className="min-h-11 rounded-lg border-2 border-line bg-paper px-3 outline-none focus:border-ink" /></label>
      <label className="grid gap-1 text-sm">Symbol<input value={sym} maxLength={10} onChange={(e) => setSym(e.target.value.toUpperCase())} className="min-h-11 rounded-lg border-2 border-line bg-paper px-3 font-mono outline-none focus:border-ink" /></label>
      <div className="flex gap-2">
        {(['sponsored', 'self'] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={`min-h-11 flex-1 rounded-full border-2 px-3 text-sm font-bold ${mode === m ? 'border-ink bg-accent text-accent-ink' : 'border-line'}`}>{m === 'sponsored' ? 'Sponsored 70/30' : 'Self launch 100%'}</button>)}
      </div>
      {mode === 'sponsored' && <label className="grid gap-1 text-sm">Example fees to split: {buy} SOL<input type="range" min={0.5} max={10} step={0.5} value={buy} onChange={(e) => setBuy(+e.target.value)} className="accent-[var(--color-accent)]" /></label>}
      <button onClick={go} className="min-h-11 rounded-full border-2 border-ink bg-accent px-5 font-bold text-accent-ink">Preview launch (dry run)</button>
      {plan && <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">{plan.map((p) => <li key={p}>{p}</li>)}</ol>}
    </div>
  )
}

function Agents() {
  const { d, e } = useJson<{ agents: { id: string; handle: string; name: string; bio?: string; avatar?: string; stats?: { tokens: number; followers: number } }[] }>('agents')
  if (e) return <p className="text-sm text-muted">Couldn't load ({e}).</p>
  if (!d) return <p className="text-sm text-muted">Loading…</p>
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {d.agents.slice(0, 8).map((a) => (
        <li key={a.id} className="flex gap-3 rounded-xl border-2 border-line bg-paper p-3">
          <img src={abs(a.avatar)} alt="" className="size-11 shrink-0 rounded-full bg-line object-cover" />
          <div className="min-w-0"><p className="truncate font-bold">{a.name} <span className="text-xs font-normal text-muted">@{a.handle}</span></p>
            <p className="line-clamp-2 text-xs text-muted">{a.bio}</p><p className="mt-1 text-xs text-muted">{a.stats?.tokens ?? 0} tokens, {a.stats?.followers ?? 0} followers</p></div>
        </li>
      ))}
    </ul>
  )
}

function Board() {
  const { d, e } = useJson<{ rows: { rank: number; name: string; symbol: string; mcapSol: number; graduated: boolean; image?: string }[] }>('leaderboard/launches')
  if (e) return <p className="text-sm text-muted">Couldn't load ({e}).</p>
  if (!d) return <p className="text-sm text-muted">Loading…</p>
  return (
    <ol className="divide-y divide-line">
      {d.rows.slice(0, 10).map((r) => (
        <li key={r.rank} className="flex items-center gap-3 py-2.5 text-sm">
          <span className="w-6 font-mono text-muted">{r.rank}</span><img src={abs(r.image)} alt="" className="size-8 rounded-full bg-line object-cover" />
          <span className="min-w-0 flex-1 truncate font-semibold">{r.name}</span><span className="text-muted">{r.mcapSol.toFixed(2)} SOL{r.graduated ? ', graduated' : ''}</span>
        </li>
      ))}
    </ol>
  )
}

function Routes() {
  const [g, setG] = useState('all')
  const groups = ['all', ...Array.from(new Set(ALL.map((r) => r.group)))]
  const list = ALL.filter((r) => g === 'all' || r.group === g)
  return (
    <div>
      <p className="text-sm text-muted">All {ALL.length} pages of the real terminal, straight from its route map. Access: P public, O owner, A account.</p>
      <div className="mt-3 flex flex-wrap gap-2">{groups.map((x) => <button key={x} onClick={() => setG(x)} className={`min-h-9 rounded-full border px-3 text-xs ${g === x ? 'border-ink bg-accent text-accent-ink' : 'border-line'}`}>{x}</button>)}</div>
      <ul className="mt-3 grid gap-2">
        {list.map((r) => (
          <li key={r.path} className="rounded-xl border border-line bg-paper p-3 text-sm">
            <p><span className="font-mono text-accent">{r.path}</span> <span className="font-bold">{r.title}</span> <span className="text-xs text-muted">access {r.access}, phase {r.phase}</span></p>
            <p className="mt-1 text-xs text-muted">{r.blurb}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Talk() {
  return (
    <div className="grid gap-3 text-sm sm:max-w-md">
      <img src="/img/scene-helper.jpg" alt="Rakaza as a helpful assistant surrounded by chat bubbles" className="aspect-video w-full rounded-xl border-2 border-line object-cover" />
      <p className="text-muted">The real Talk page streams AI replies and voice. That needs server keys, so here the helper answers from the project’s own notes instead.</p>
      <button onClick={() => window.dispatchEvent(new CustomEvent('rk-open-chat'))} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-ink bg-accent px-5 font-bold text-accent-ink"><MessageCircle className="size-4" aria-hidden /> Chat with the helper</button>
    </div>
  )
}

export function LocalPreview({ running, onStart }: { running: boolean; onStart: () => void }) {
  const [page, setPage] = useState<Page>('Home')
  const [n, setN] = useState(0)
  const frame = useRef<HTMLDivElement>(null)
  useEffect(() => { if (running) setTimeout(() => frame.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150) }, [running])
  if (!running) {
    return (
      <div className="mt-6 grid place-items-center rounded-card border-2 border-dashed border-line p-8 text-center">
        <Globe className="size-8 text-muted" aria-hidden />
        <p className="mt-3 font-bold">localhost:3200 is not running</p>
        <p className="mt-1 max-w-sm text-sm text-muted">Run <span className="font-mono">npm run dev</span> in the terminal above, and the project opens here like a real localhost.</p>
        <button onClick={onStart} className="mt-4 min-h-11 rounded-full border-2 border-ink bg-accent px-5 text-sm font-bold text-accent-ink">Run the whole setup for me</button>
      </div>
    )
  }
  return (
    <div ref={frame} className="rk-pop mt-6 overflow-hidden rounded-card border-2 border-ink bg-card shadow-[6px_6px_0_var(--color-mint)]">
      <div className="flex items-center gap-2 border-b-2 border-line bg-paper px-3 py-2">
        <button onClick={() => setN((x) => x + 1)} aria-label="Reload" className="grid size-8 place-items-center rounded-full border border-line"><RotateCw className="size-3.5" /></button>
        <div className="min-w-0 flex-1 truncate rounded-full bg-night px-3 py-1 text-xs"><span className="text-mint">●</span> localhost:3200{PATH[page]}</div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-b border-line px-2 py-2" aria-label="localhost pages">
        {PAGES.map((p) => <button key={p} onClick={() => setPage(p)} className={`min-h-9 shrink-0 rounded-full px-4 text-sm font-bold ${page === p ? 'bg-accent text-accent-ink' : 'text-muted hover:text-ink'}`}>{p}</button>)}
      </nav>
      <div key={page + n} className="rk-rise max-h-[70vh] overflow-auto p-4">
        {page === 'Home' && <Home />}{page === 'Explore' && <Explore />}{page === 'Launch' && <Launch />}{page === 'Agents' && <Agents />}
        {page === 'Leaderboard' && <Board />}{page === 'Routes' && <Routes />}{page === 'Talk' && <Talk />}
      </div>
      <p className="border-t border-line px-4 py-2 text-xs text-muted">A preview of what localhost:3200 serves after setup, built from the real terminal’s public data and route map. Launching and AI chat need the real project and your keys.</p>
    </div>
  )
}
