import { useEffect, useMemo, useRef, useState } from 'react'
import { lazy, Suspense } from 'react'
import { Orbit, Sparkles, LineChart, SquareTerminal, Clapperboard, MessagesSquare } from 'lucide-react'
import { Reveal } from './Reveal'
import { ArrowUpRight, Code2, ExternalLink, RefreshCw, Search, Trophy, Users, Rocket, Info } from 'lucide-react'

const ORIGIN = 'https://rakaza-ai-terminal.vercel.app'
const API = `${ORIGIN}/api/public`
const GIT = 'https://github.com/Maliot100X/RakazaAiTerminal'

type Token = {
  mint: string; name: string; symbol: string; description?: string; image?: string; network: string; mode?: string; launchedAt?: string
  links?: { explorer?: string; pumpfun?: string; page?: string }
  curve?: { progressPct: number; complete: boolean; graduatingSoon: boolean }
  market?: { marketCapSol: number | null; priceSol: number | null; volume24hSol: number; trades24h: number }
}
type Agent = { id: string; handle: string; name: string; bio?: string; avatar?: string; verified?: boolean; stats?: { followers: number; tokens: number; posts: number } }
type LaunchRow = { rank: number; mint: string; name: string; symbol: string; image?: string; mcapSol: number; volume24hSol: number; trades24h: number; progressPct: number; graduated: boolean }
type AgentRow = { rank: number; handle: string; name: string; verified?: boolean; launches: number; volumeSol: number; followers: number; avatar?: string }

const OrbitView = lazy(() => import('./Orbit3D').then((m) => ({ default: m.Orbit3D })))
const AvatarView = lazy(() => import('./Avatar3D').then((m) => ({ default: m.Avatar3D })))
const ChatbotView = lazy(() => import('./Chatbot').then((m) => ({ default: m.Chatbot })))
const TerminalView = lazy(() => import('./Terminal').then((m) => ({ default: m.Terminal })))
const MediaView = lazy(() => import('./Media').then((m) => ({ default: m.Media })))
const CommunityView = lazy(() => import('./Community').then((m) => ({ default: m.Community })))
const MarketView = lazy(() => import('./Market').then((m) => ({ default: m.Market })))

const abs = (u?: string) => (!u ? undefined : u.startsWith('http') ? u : ORIGIN + u)
const sol = (n?: number | null) => (n == null ? 'n/a' : n >= 100 ? n.toFixed(0) : n >= 1 ? n.toFixed(2) : n.toFixed(3)) + ' SOL'

function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let live = true
    setData(null); setErr(null)
    fetch(`${API}/${path}`).then(async (r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    }).then((d) => live && setData(d)).catch((e) => live && setErr(String(e.message || e)))
    return () => { live = false }
  }, [path, tick])
  return { data, err, reload: () => setTick((t) => t + 1) }
}

function State({ err, loading, reload }: { err: string | null; loading: boolean; reload: () => void }) {
  if (err) return (
    <div className="rounded-card border-2 border-line bg-card p-6">
      <p className="font-semibold">Couldn't load live data ({err}).</p>
      <button onClick={reload} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink px-5 font-bold"><RefreshCw className="size-4" /> Try again</button>
    </div>
  )
  if (loading) return <p className="py-10 text-muted">Loading live data…</p>
  return null
}

function TokenSheet({ t: open, onClose }: { t: Token; onClose: () => void }) {
  const setOpen = (_: null) => onClose()
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/60 sm:place-items-center" onClick={() => setOpen(null)}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full overflow-auto rounded-t-3xl border-2 border-ink bg-paper p-6 sm:max-w-lg sm:rounded-card">
            <div className="flex items-center gap-4">
              <img src={abs(open.image)} alt="" className="size-16 rounded-lg bg-line object-cover" />
              <div><h3 className="font-display text-2xl font-black">{open.name}</h3><p className="font-mono text-muted">${open.symbol} · {open.network}{open.mode ? ` · ${open.mode}` : ''}</p></div>
            </div>
            {open.description && <p className="mt-4 text-muted">{open.description}</p>}
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {[['Market cap', sol(open.market?.marketCapSol)], ['Price', open.market?.priceSol != null ? open.market.priceSol.toExponential(2) + ' SOL' : 'n/a'], ['24h volume', sol(open.market?.volume24hSol)], ['24h trades', String(open.market?.trades24h ?? 0)], ['Curve', `${Math.round(open.curve?.progressPct ?? 0)}%${open.curve?.complete ? ' (graduated)' : ''}`], ['Launched', open.launchedAt ? new Date(open.launchedAt).toLocaleDateString() : 'n/a']].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-night p-3"><dt className="text-muted">{k}</dt><dd className="font-bold">{v}</dd></div>
              ))}
            </dl>
            <p className="mt-4 break-all font-mono text-xs text-muted">{open.mint}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {open.links?.page && <a href={open.links.page} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-accent px-5 font-bold text-accent-ink">Full page <ArrowUpRight className="size-4" /></a>}
              {open.links?.explorer && <a href={open.links.explorer} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-line px-5 font-bold">Explorer <ExternalLink className="size-4" /></a>}
              {open.links?.pumpfun && <a href={open.links.pumpfun} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-line px-5 font-bold">pump.fun <ExternalLink className="size-4" /></a>}
            </div>
            <button onClick={() => setOpen(null)} className="mt-5 min-h-11 w-full rounded-full border-2 border-line font-bold">Close</button>
          </div>
        </div>
      )}
    </>
  )
}

function Launches() {
  const { data, err, reload } = useApi<{ tokens: Token[]; network: string }>('tokens')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Token | null>(null)
  const list = useMemo(() => (data?.tokens ?? []).filter((t) => (t.name + t.symbol + t.mint).toLowerCase().includes(q.toLowerCase())), [data, q])
  return (
    <div>
      <div className="flex items-center gap-3">
        <label className="flex min-h-12 flex-1 items-center gap-2 rounded-full border-2 border-line bg-card px-4">
          <Search className="size-4 text-muted" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, symbol or mint" className="w-full bg-transparent outline-none" />
        </label>
        <button onClick={reload} aria-label="Refresh" className="grid size-12 place-items-center rounded-full border-2 border-line"><RefreshCw className="size-4" /></button>
      </div>
      <State err={err} loading={!data && !err} reload={reload} />
      {data && <p className="mt-4 text-sm text-muted">{list.length} launches on {data.network}</p>}
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {list.map((t, i) => (
          <li key={t.mint}><Reveal delay={(i % 4) * 70}>
            <button onClick={() => setOpen(t)} className="flex w-full items-center gap-4 rounded-card border-2 border-line bg-card p-4 text-left hover:border-ink">
              <img src={abs(t.image)} alt="" className="size-14 shrink-0 rounded-lg bg-line object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{t.name} <span className="font-mono text-sm text-muted">${t.symbol}</span></p>
                <p className="text-sm text-muted">MC {sol(t.market?.marketCapSol)} · curve {Math.round(t.curve?.progressPct ?? 0)}%</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full bg-accent" style={{ width: `${Math.min(100, t.curve?.progressPct ?? 0)}%` }} /></div>
              </div>
            </button>
          </Reveal></li>
        ))}
      </ul>
      {open && <TokenSheet t={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

function Universe() {
  const { data, err, reload } = useApi<{ tokens: Token[]; network: string }>('tokens')
  const [sel, setSel] = useState<Token | null>(null)
  const orbit = useMemo(() => (data?.tokens ?? []).map((t) => ({ mint: t.mint, name: t.name, symbol: t.symbol, image: abs(t.image), progress: t.curve?.progressPct ?? 0, mcap: t.market?.marketCapSol ?? null })), [data])
  return (
    <div className="relative overflow-hidden rounded-card border-2 border-line rk-galaxy">
      <div className="h-[68vh] min-h-[440px] w-full">
        {data && <Suspense fallback={null}><OrbitView tokens={orbit} onSelect={(m) => setSel(data.tokens.find((t) => t.mint === m) ?? null)} /></Suspense>}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap gap-2 p-4">
        <span className="rounded-full bg-paper px-3 py-1 font-mono text-xs">{data ? `${data.tokens.length} launches · ${data.network}` : 'loading…'}</span>
        <span className="rounded-full bg-paper px-3 py-1 text-xs text-muted">Tap a coin. The ring shows bonding curve progress.</span>
      </div>
      {!data && !err && <p className="absolute inset-0 grid place-items-center text-muted">Charting the galaxy…</p>}
      {err && <div className="absolute inset-0 grid place-items-center p-6"><State err={err} loading={false} reload={reload} /></div>}
      {sel && <TokenSheet t={sel} onClose={() => setSel(null)} />}
    </div>
  )
}

function Agents() {
  const { data, err, reload } = useApi<{ agents: Agent[] }>('agents')
  return (
    <div>
      <State err={err} loading={!data && !err} reload={reload} />
      <ul className="grid gap-4 sm:grid-cols-2">
        {data?.agents.map((a) => (
          <li key={a.id}>
            <a href={`${ORIGIN}/agents/${a.handle}`} target="_blank" rel="noreferrer" className="flex gap-4 rounded-card border-2 border-line bg-card p-4 hover:border-ink">
              <img src={abs(a.avatar)} alt="" className="size-14 shrink-0 rounded-full bg-line object-cover" />
              <div className="min-w-0">
                <p className="font-bold">{a.name}{a.verified ? ' ✓' : ''} <span className="text-sm font-normal text-muted">@{a.handle}</span></p>
                {a.bio && <p className="mt-1 line-clamp-2 text-sm text-muted">{a.bio}</p>}
                <p className="mt-2 text-xs text-muted">{a.stats?.tokens ?? 0} tokens, {a.stats?.followers ?? 0} followers, {a.stats?.posts ?? 0} posts</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Board() {
  const [tab, setTab] = useState<'launches' | 'agents'>('launches')
  const { data, err, reload } = useApi<{ rows: (LaunchRow & AgentRow)[] }>(`leaderboard/${tab}`)
  return (
    <div>
      <div className="flex gap-2">
        {(['launches', 'agents'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`min-h-11 rounded-full border-2 px-5 font-bold capitalize ${tab === t ? 'border-ink bg-ink text-paper' : 'border-line'}`}>{t}</button>
        ))}
      </div>
      <State err={err} loading={!data && !err} reload={reload} />
      <ol className="mt-4 divide-y divide-line border-y border-line">
        {data?.rows.map((r) => (
          <li key={r.rank} className="flex items-center gap-4 py-3">
            <span className="w-7 font-mono text-muted">{r.rank}</span>
            <img src={abs(tab === 'launches' ? r.image : r.avatar)} alt="" className="size-10 rounded-full bg-line object-cover" />
            <span className="min-w-0 flex-1 truncate font-semibold">{r.name}</span>
            <span className="text-right text-sm text-muted">
              {tab === 'launches' ? `${sol(r.mcapSol)}${r.graduated ? ' · graduated' : ''}` : `${r.launches} launches · ${sol(r.volumeSol)}`}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function About() {
  return (
    <div className="space-y-5 text-lg text-muted">
      <p>Rakaza AI Terminal is an open-source Solana pump.fun launchpad with an AI agent, a Telegram control bot and a live voice avatar. Launches use a 70/30 fee split on sponsored launches, and self launches keep 100%.</p>
      <p>This view shows live public data from the terminal. Launching, trading, chatting with Rakaza by voice and the Telegram bot need wallets and keys, so they run in the full terminal.</p>
      <div className="flex flex-wrap gap-3">
        <a href={ORIGIN} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-ink bg-accent px-6 font-bold text-accent-ink">Open the full terminal <ArrowUpRight className="size-4" /></a>
        <a href={GIT} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-ink/40 px-6 font-bold text-ink"><Code2 className="size-4" /> Source code</a>
      </div>
      <p className="text-sm">Experimental, not financial advice. Rakaza never asks for your seed phrase or private key.</p>
    </div>
  )
}

const tabs = [
  { id: 'orbit', label: 'Universe', icon: Orbit },
  { id: 'avatar', label: 'Rakaza 3D', icon: Sparkles },
  { id: 'terminal', label: 'Terminal', icon: SquareTerminal },
  { id: 'media', label: 'Video', icon: Clapperboard },
  { id: 'market', label: 'Market', icon: LineChart },
  { id: 'launches', label: 'Launches', icon: Rocket },
  { id: 'agents', label: 'Agents', icon: Users },
  { id: 'community', label: 'Community', icon: MessagesSquare },
  { id: 'board', label: 'Leaderboard', icon: Trophy },
  { id: 'about', label: 'About', icon: Info },
] as const

export function Explorer() {
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('orbit')
  const [mounted, setMounted] = useState(false)
  const bannerRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (bannerRef.current) bannerRef.current.style.transform = `translateY(${-Math.min(window.scrollY, 400) * 0.25}px)` }) }
    window.addEventListener('scroll', on, { passive: true }); return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [])
  useEffect(() => setMounted(true), [])
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="relative h-36 overflow-hidden md:h-56"><img ref={bannerRef} src="/brand/banner.jpg" alt="Rakaza AI Terminal" className="absolute inset-x-0 top-0 h-[140%] w-full object-cover will-change-transform" /></div>
      <main className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="font-display text-5xl font-black tracking-tight text-lav uppercase [text-shadow:4px_4px_0_var(--color-pink)] md:text-7xl" style={{ animation: "rise .6s both" }}>Rakaza Terminal</h1>
        <p className="mt-3 max-w-xl text-muted" style={{ animation: "rise .6s .1s both" }}>Live Solana launches in 3D, a talking avatar and the trending market, all in one tab.</p>
        <nav className="mt-6 flex gap-2 overflow-x-auto pb-1" aria-label="Sections">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border-2 px-5 font-bold ${tab === id ? 'border-ink bg-accent text-accent-ink' : 'border-line'}`}>
              <Icon className="size-4" aria-hidden /> {label}
            </button>
          ))}
        </nav>
        <div key={tab} className="mt-8 rk-rise">
          {tab === 'orbit' && mounted && <Universe />}
          {tab === 'avatar' && mounted && <Suspense fallback={<p className="py-10 text-muted">Loading 3D…</p>}><AvatarView /></Suspense>}
          {tab === 'terminal' && mounted && <Suspense fallback={null}><TerminalView /></Suspense>}
          {tab === 'media' && mounted && <Suspense fallback={null}><MediaView /></Suspense>}
          {tab === 'community' && mounted && <Suspense fallback={null}><CommunityView /></Suspense>}
          {tab === 'market' && mounted && <Suspense fallback={null}><MarketView /></Suspense>}
          {tab === 'launches' && <Launches />}
          {tab === 'agents' && <Agents />}
          {tab === 'board' && <Board />}
          {tab === 'about' && <About />}
        </div>
      </main>
      {mounted && <Suspense fallback={null}><ChatbotView onNavigate={(t) => setTab(t)} /></Suspense>}
    </div>
  )
}
