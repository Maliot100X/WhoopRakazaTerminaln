import { useEffect, useState } from 'react'
import { ArrowUpRight, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react'

type Pair = {
  url: string; priceUsd?: string; marketCap?: number; fdv?: number
  baseToken: { address: string; name: string; symbol: string }
  volume?: { h24?: number }; priceChange?: { h24?: number }; liquidity?: { usd?: number }
  info?: { imageUrl?: string }
}
const BLOCK = /nigg|fagg|retard|rape|nazi|hitler|kike|chink|spic|tranny|cunt|child|loli|porn|titt|slut|whore/i
const SOL = 'So11111111111111111111111111111111111111112'
const usd = (n?: number) => (n == null ? 'n/a' : n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(2)}`)

export function Market() {
  const [sol, setSol] = useState<Pair | null>(null)
  const [rows, setRows] = useState<Pair[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let live = true
    setErr(null)
    ;(async () => {
      try {
        const boosts: { chainId: string; tokenAddress: string }[] = await (await fetch('https://api.dexscreener.com/token-boosts/top/v1')).json()
        const addrs = [...new Set(boosts.filter((b) => b.chainId === 'solana').map((b) => b.tokenAddress))].slice(0, 20)
        const res = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${[SOL, ...addrs].join(',')}`)
        const pairs: Pair[] = await res.json()
        const best = new Map<string, Pair>()
        for (const p of pairs) { const k = p.baseToken.address; const cur = best.get(k); if (!cur || (p.liquidity?.usd ?? 0) > (cur.liquidity?.usd ?? 0)) best.set(k, p) }
        if (!live) return
        setSol(best.get(SOL) ?? null)
        best.delete(SOL)
        setRows([...best.values()].filter((p) => !BLOCK.test(p.baseToken.name + ' ' + p.baseToken.symbol)).sort((a, b) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0)))
      } catch (e) { if (live) setErr(String((e as Error).message || e)) }
    })()
    return () => { live = false }
  }, [tick])

  const ch = sol?.priceChange?.h24
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border-2 border-ink bg-card p-6 shadow-[6px_6px_0_var(--color-mint)]">
        <div>
          <p className="text-sm text-muted">Solana price</p>
          <p className="mt-1 font-display text-5xl font-black tabular-nums">{sol?.priceUsd ? `$${Number(sol.priceUsd).toFixed(2)}` : '…'}</p>
        </div>
        {ch != null && (
          <p className={`inline-flex items-center gap-2 text-xl font-bold ${ch >= 0 ? 'text-mint' : 'text-pink'}`}>
            {ch >= 0 ? <TrendingUp className="size-6" /> : <TrendingDown className="size-6" />} {ch >= 0 ? '+' : ''}{ch.toFixed(2)}% <span className="text-sm font-normal text-muted">24h</span>
          </p>
        )}
        <button onClick={() => { setRows(null); setTick((t) => t + 1) }} aria-label="Refresh" className="grid size-12 place-items-center rounded-full border-2 border-line"><RefreshCw className="size-4" /></button>
      </div>
      <h2 className="mt-10 font-display text-2xl font-black">Trending on Solana right now</h2>
      <p className="mt-1 text-sm text-muted">The most boosted tokens on DexScreener, sorted by 24h volume. Live data, not advice.</p>
      {err && <p className="mt-6 text-muted">Couldn't load the market ({err}).</p>}
      {!rows && !err && <p className="py-8 text-muted">Loading market…</p>}
      <ul className="mt-5 grid gap-3">
        {rows?.map((p, i) => {
          const c = p.priceChange?.h24
          return (
            <li key={p.baseToken.address}>
              <a href={p.url} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-card border-2 border-line bg-card p-4 transition hover:-translate-y-0.5 hover:border-ink" style={{ animation: `rise .5s ${i * 40}ms both` }}>
                <span className="w-6 font-mono text-muted">{i + 1}</span>
                {p.info?.imageUrl ? <img src={p.info.imageUrl} alt="" className="size-11 rounded-full bg-line object-cover" /> : <span className="grid size-11 place-items-center rounded-full bg-line font-bold">{p.baseToken.symbol.slice(0, 2)}</span>}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{p.baseToken.name} <span className="font-mono text-sm text-muted">${p.baseToken.symbol}</span></p>
                  <p className="text-sm text-muted">Market cap {usd(p.marketCap ?? p.fdv)}, volume {usd(p.volume?.h24)}, liquidity {usd(p.liquidity?.usd)}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm">{p.priceUsd ? `$${Number(p.priceUsd) < 0.01 ? Number(p.priceUsd).toExponential(2) : Number(p.priceUsd).toFixed(4)}` : ''}</p>
                  {c != null && <p className={`text-sm font-bold ${c >= 0 ? 'text-mint' : 'text-pink'}`}>{c >= 0 ? '+' : ''}{c.toFixed(1)}%</p>}
                </div>
                <ArrowUpRight className="hidden size-4 text-muted sm:block" aria-hidden />
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
