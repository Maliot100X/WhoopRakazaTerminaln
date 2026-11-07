import { useEffect, useRef, useState } from 'react'
import { LocalPreview } from './LocalPreview'

const ORIGIN = 'https://rakaza-ai-terminal.vercel.app'
const API = `${ORIGIN}/api/public`
const REPO = 'https://github.com/Maliot100X/RakazaAiTerminal'
const DEPS = ['next@16.4.3', 'react@19.3.0', '@pump-fun/pump-sdk', '@solana/web3.js@1.99.0', '@solana/spl-token', '@pixiv/three-vrm', '@react-three/fiber', 'three@0.186.1', '@neondatabase/serverless', '@upstash/redis', 'lightweight-charts', 'zod@4.6.7']

type Line = { t: string; c?: 'dim' | 'ok' | 'err' | 'acc' | 'pink' | 'cmd' }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const THEMES: Record<string, string> = { violet: '#b388ff', mint: '#3ff0c3', amber: '#ffc933', pink: '#ff4da6' }

const HELP = [
  'Getting started (try these in order):',
  '  git clone ' + REPO,
  '  cd RakazaAiTerminal',
  '  npm install',
  '  cp .env.example .env.local',
  '  npm run dev          start the app on localhost:3200',
  '',
  'Live commands (real data from the Rakaza terminal):',
  '  rakaza health        is the terminal up?',
  '  rakaza tokens        latest launches',
  '  rakaza agents        registered agents',
  '  rakaza board         launch leaderboard',
  '  rakaza price         live SOL price',
  '  curl <url>           fetch a public Rakaza API url',
  '',
  'Play:',
  '  launch --name "My Coin" --symbol MYC    dry run, plans a launch and the 70/30 split',
  '  theme violet|mint|amber|pink            change the colour',
  '  rakaza say           she says something',
  '  neofetch · matrix · clear · help',
]

const SAYS = [
  'gm. No seed phrases today.',
  'Devnet first, always.',
  'Self launch keeps 100%. Sponsored launch is 70 to you, 30 to the agent.',
  'I read the chart so you stay calm.',
  'Do your own research. I will wait.',
]

export function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { t: 'Rakaza demo shell', c: 'acc' },
    { t: 'Runs in your browser. Network commands (rakaza ..., curl) call the real public API. Install and dev-server steps are a simulation, nothing is installed on your device.', c: 'dim' },
    { t: 'Type help, or tap a command below.', c: 'dim' },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [accent, setAccent] = useState('#3ff0c3')
  const [cwd, setCwd] = useState('~')
  const [running, setRunning] = useState(false)
  const st = useRef({ cwd: '~', last: '', lastAt: 0, cloned: false, installed: false, env: false, running: false, hist: [] as string[], hi: -1 })
  const setCwdBoth = (v: string) => { st.current.cwd = v; setCwd(v) }
  const box = useRef<HTMLDivElement>(null)
  const alive = useRef(true)
  useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])
  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight }) }, [lines])

  const out = (t: string, c?: Line['c']) => alive.current && setLines((l) => [...l.slice(-400), { t, c }])
  const health = async () => {
    try { const r = await fetch(`${ORIGIN}/api/health`); if (!r.ok) throw new Error(); return { j: await r.json(), live: true } }
    catch { return { j: { ok: true, phase: 1, network: 'devnet', envValid: true, execute: 'enabled' }, live: false } }
  }
  const getJson = async (path: string) => {
    const r = await fetch(path.startsWith('http') ? path : `${API}/${path}`)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  }

  async function run(raw: string) {
    const cmd = raw.trim()
    if (!cmd) return
    const s = st.current
    s.hist.push(cmd); s.hi = -1
    out(`${s.cwd === '~' ? '~' : '~/' + s.cwd}$ ${cmd}`, 'cmd')
    setBusy(true)
    try {
      const [a, b, ...rest] = cmd.split(/\s+/)
      if (cmd === 'clear') { setLines([]) }
      else if (cmd === 'help') HELP.forEach((l) => out(l, l.startsWith('  ') ? undefined : 'acc'))
      else if (cmd === 'ls') out(cwd === '~' ? (s.cloned ? 'RakazaAiTerminal/' : '(empty)') : ['src/', 'public/', 'docs/', 'tests/', 'cli/', 'package.json', 'README.md', '.env.example', ...(s.installed ? ['node_modules/'] : []), ...(s.env ? ['.env.local'] : [])].join('  '))
      else if (cmd === 'whoami') out('guest, welcome to Rakaza')
      else if (cmd === 'cat README.md') { out('Rakaza AI Terminal', 'acc'); out('Open-source Solana pump.fun launchpad with an AI character, a permanent 70/30 fee split on sponsored launches (self launch: you keep 100%), vanity grinding, an agent API and a Telegram admin bot.'); out('Devnet first. Nothing is signed unless EXECUTE_ENABLED is exactly true.', 'dim') }
      else if (cmd === 'neofetch') { ['   ____      _          ', '  |  _ \\ __ _| | ____ _ ', '  | |_) / _` | |/ / _` |', '  |  _ < (_| |   < (_| |', '  |_| \\_\\__,_|_|\\_\\__,_|'].forEach((l) => out(l, 'acc')); out('OS: Whop hosted, in your browser'); out('Chain: Solana (devnet first)'); out('Fee split: 70/30 sponsored, 100% self launch'); out('Brain: River, voice: Deepgram, avatar: VRM') }
      else if (cmd === 'matrix') { for (let i = 0; i < 6; i++) { out(Array.from({ length: 38 }, () => '01$SOLRKZ◆'[Math.floor(Math.random() * 10)]).join(' '), 'ok'); await sleep(120) } }
      else if (a === 'theme') { const c = THEMES[b]; if (c) { setAccent(c); out(`theme set to ${b}`, 'ok') } else out('usage: theme violet|mint|amber|pink', 'err') }
      else if (a === 'cd') { if (b === 'RakazaAiTerminal' || b === 'RakazaAiTerminal/') { if (!s.cloned) out('cd: no such directory. Run git clone first.', 'err'); else setCwdBoth('RakazaAiTerminal') } else if (b === '..' || b === '~') setCwdBoth('~'); else out(`cd: ${b}: no such directory`, 'err') }
      else if (a === 'git' && b === 'clone') {
        const url = rest[0] ?? ''
        if (!/Maliot100X\/RakazaAiTerminal/i.test(url)) out(`try: git clone ${REPO}`, 'dim')
        else { for (const l of ['Cloning into \'RakazaAiTerminal\'...', 'remote: Enumerating objects: 1,842, done.', 'Receiving objects: 100% (1842/1842), 38.4 MiB | 21.0 MiB/s, done.', 'Resolving deltas: 100% (903/903), done.']) { out(l, 'dim'); await sleep(260) } s.cloned = true; out('Cloned. Next: cd RakazaAiTerminal', 'ok') }
      }
      else if (cmd === 'npm install' || cmd === 'npm i') {
        if (s.cwd === '~' || !s.cloned) out('npm: no package.json here. cd RakazaAiTerminal first.', 'err')
        else { for (const d of DEPS) { out(`+ ${d}`, 'dim'); await sleep(110) } s.installed = true; out('added 1,204 packages in 38s', 'ok'); out('(simulated: nothing was installed on your device)', 'dim') }
      }
      else if (a === 'cp' && b === '.env.example') { if (!s.cloned) out('cp: cannot stat .env.example', 'err'); else { s.env = true; out('.env.local created. The repo has no secrets: pages work with zero keys, features that need a key say "not configured".', 'ok') } }
      else if (cmd === 'npm run dev') {
        if (!s.installed) out('Run npm install first.', 'err')
        else { for (const l of ['> rakaza-tokenization@0.1.0 dev', '> next dev -p 3200', '', '▲ Next.js 16.4.3', '- Local: http://localhost:3200', '✓ Ready in 1.9s']) { out(l, l.startsWith('✓') ? 'ok' : 'dim'); await sleep(240) } s.running = true; setRunning(true); out('Try: curl localhost:3200/api/health. The project is open below.', 'acc') }
      }
      else if (a === 'curl') {
        const u = b ?? ''
        if (/^(http:\/\/)?localhost:3200\/api\/health/.test(u)) {
          if (!s.running) out('curl: (7) Failed to connect to localhost port 3200. Run npm run dev first.', 'err')
          else { const { j, live } = await health(); out(JSON.stringify(j), 'ok'); out(live ? '(demo: answered by the live Rakaza terminal, not your machine)' : '(demo: the live endpoint blocks browser requests, showing its last known answer)', 'dim') }
        } else if (/^https:\/\/rakaza-ai-terminal\.vercel\.app\/api\/(public|health)/.test(u)) { const j = await getJson(u); out(JSON.stringify(j).slice(0, 900) + (JSON.stringify(j).length > 900 ? ' ...' : ''), 'ok') }
        else out('Only the public Rakaza API is allowed here, for example: curl https://rakaza-ai-terminal.vercel.app/api/public/tokens', 'err')
      }
      else if (a === 'rakaza') {
        if (b === 'health') { const { j } = await health(); out(`ok=${j.ok} network=${j.network} envValid=${j.envValid} execute=${j.execute}`, 'ok') }
        else if (b === 'tokens') { const j = await getJson('tokens'); out(`${j.count} launches on ${j.network}`, 'acc'); j.tokens.slice(0, 10).forEach((t: { symbol: string; name: string; curve?: { progressPct: number }; market?: { marketCapSol: number } }) => out(`  $${t.symbol.padEnd(8)} ${t.name.slice(0, 24).padEnd(25)} curve ${String(Math.round(t.curve?.progressPct ?? 0)).padStart(3)}%  mc ${(t.market?.marketCapSol ?? 0).toFixed(2)} SOL`)) }
        else if (b === 'agents') { const j = await getJson('agents'); j.agents.slice(0, 10).forEach((x: { handle: string; name: string; stats?: { tokens: number; followers: number } }) => out(`  @${x.handle.padEnd(22)} ${x.name.slice(0, 20).padEnd(21)} tokens ${x.stats?.tokens ?? 0}  followers ${x.stats?.followers ?? 0}`)) }
        else if (b === 'board') { const j = await getJson('leaderboard/launches'); j.rows.slice(0, 8).forEach((r: { rank: number; symbol: string; mcapSol: number; graduated: boolean }) => out(`  #${r.rank} $${r.symbol.padEnd(8)} ${r.mcapSol.toFixed(2)} SOL${r.graduated ? '  graduated' : ''}`)) }
        else if (b === 'price') { const d = await getJson('https://api.dexscreener.com/tokens/v1/solana/So11111111111111111111111111111111111111112'); out(`SOL $${Number(d[0].priceUsd).toFixed(2)}  (${d[0].priceChange?.h24 >= 0 ? '+' : ''}${d[0].priceChange?.h24}% 24h)`, 'ok') }
        else if (b === 'say') out('Rakaza: ' + SAYS[Math.floor(Math.random() * SAYS.length)], 'pink')
        else out('usage: rakaza health|tokens|agents|board|price|say', 'err')
      }
      else if (a === 'launch') {
        const name = /--name\s+"([^"]+)"|--name\s+(\S+)/.exec(cmd), sym = /--symbol\s+(\S+)/.exec(cmd)
        const n = name?.[1] ?? name?.[2], y = sym?.[1]
        if (!n || !y) out('usage: launch --name "My Coin" --symbol MYC', 'err')
        else {
          out(`DRY RUN. Nothing is sent to any chain.`, 'acc')
          for (const l of ['1. validate name and symbol', '2. upload metadata (image + description) to IPFS', '3. build pump.fun create instruction on devnet', '4. preview fee split']) { out(l, 'dim'); await sleep(280) }
          out(`$${y.toUpperCase().slice(0, 10)} "${n}" ready`, 'ok')
          out('  sponsored launch: 70% to you, 30% to the agent', undefined); out('  self launch:      you keep 100% (service fee applies)', undefined)
          out('To launch for real, use the full terminal and sign with your own wallet.', 'dim')
        }
      }
      else out(`${a}: command not found. Type help.`, 'err')
    } catch (e) { out(`error: ${(e as Error).message}`, 'err') }
    setBusy(false)
  }

  const runRef = useRef(run)
  runRef.current = run
  useEffect(() => {
    const go = (c: string) => { const s = st.current; if (s.last === c && Date.now() - s.lastAt < 1500) return; s.last = c; s.lastAt = Date.now(); void runRef.current(c) }
    const w = window as unknown as { __rkPending?: string }
    if (w.__rkPending) { const c = w.__rkPending; w.__rkPending = undefined; setTimeout(() => go(c), 250) }
    const h = (e: Event) => { w.__rkPending = undefined; go((e as CustomEvent<string>).detail) }
    window.addEventListener('rk-run', h)
    return () => window.removeEventListener('rk-run', h)
  }, [])
  async function autoSetup() {
    const seq = ['git clone ' + REPO, 'cd RakazaAiTerminal', 'npm install', 'cp .env.example .env.local', 'npm run dev']
    for (const c of seq) { if (!alive.current) return; await run(c) }
  }

  const chips = ['Run the whole setup for me', 'help', 'git clone ' + REPO, 'cd RakazaAiTerminal', 'npm install', 'cp .env.example .env.local', 'npm run dev', 'curl localhost:3200/api/health', 'rakaza tokens', 'rakaza price', 'launch --name "Moon Cat" --symbol MCAT', 'rakaza say', 'theme pink']
  const color = (c?: Line['c']) => c === 'dim' ? 'text-white/50' : c === 'ok' ? 'text-mint' : c === 'err' ? 'text-pink' : c === 'acc' ? 'text-accent' : c === 'pink' ? 'text-pink' : c === 'cmd' ? 'text-white' : 'text-white/85'

  return (
    <div>
      <div className="overflow-hidden rounded-card border-2 border-line bg-night" style={{ ['--acc' as string]: accent }}>
        <div className="flex items-center gap-2 bg-paper px-4 py-2.5">
          <span className="text-xs text-muted">rakaza@demo: {cwd}</span>
          <span className="ml-auto font-mono text-[10px] text-muted">{st.current.running ? '● localhost:3200' : '○ not running'}</span>
        </div>
        <div ref={box} onClick={() => document.getElementById('rk-in')?.focus()} className="h-[52vh] min-h-[320px] overflow-auto p-4 font-mono text-[13px] leading-relaxed">
          {lines.map((l, i) => <div key={i} className={`whitespace-pre-wrap break-words ${color(l.c)}`} style={l.c === 'cmd' ? { color: accent } : undefined}>{l.t}</div>)}
          <form onSubmit={(e) => { e.preventDefault(); const v = input; setInput(''); if (!busy) run(v) }} className="mt-1 flex items-center gap-2">
            <span style={{ color: accent }}>{cwd === '~' ? '~' : '~/' + cwd}$</span>
            <input id="rk-in" value={input} onChange={(e) => setInput(e.target.value)} disabled={busy} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-label="Terminal input"
              onKeyDown={(e) => { const s = st.current; if (e.key === 'ArrowUp') { e.preventDefault(); s.hi = Math.min(s.hist.length - 1, s.hi + 1); setInput(s.hist[s.hist.length - 1 - s.hi] ?? '') } if (e.key === 'ArrowDown') { e.preventDefault(); s.hi = Math.max(-1, s.hi - 1); setInput(s.hi < 0 ? '' : s.hist[s.hist.length - 1 - s.hi]) } }}
              className="min-w-0 flex-1 bg-transparent text-white caret-current outline-none" style={{ caretColor: accent }} />
          </form>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">Tap to run:</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {chips.map((c) => <button key={c} disabled={busy} onClick={() => (c.startsWith('Run the whole') ? autoSetup() : run(c))} className="min-h-10 max-w-full truncate rounded-full border border-line bg-card px-4 font-mono text-xs hover:border-ink disabled:opacity-50">{c.length > 34 ? c.slice(0, 32) + '…' : c}</button>)}
      </div>
      <LocalPreview running={running} onStart={() => { if (!busy) void autoSetup() }} />
    </div>
  )
}
