import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, Bot, Mic, Send, Rocket, Percent, Code2, ShieldCheck } from 'lucide-react'

const GIT = 'https://github.com/Maliot100X/RakazaAiTerminal'
const WEB = 'https://rakaza-ai-terminal.vercel.app/'

const features = [
  { icon: Rocket, title: 'pump.fun launchpad', body: 'Launch a coin on Solana and browse every token launched through the terminal, each with its own public page.' },
  { icon: Bot, title: 'AI agent', body: 'Rakaza reads Solana and pump.fun data through her tools and talks it through with you in plain language.' },
  { icon: Percent, title: '70/30 fee split', body: 'Launch fees are split 70/30 by design, written into the open-source code for anyone to read.' },
  { icon: Send, title: 'Telegram control bot', body: 'Run the terminal from your phone. Check launches and control the agent from Telegram.' },
  { icon: Mic, title: 'Live voice avatar', body: 'A 3D character that listens, answers out loud and lip-syncs, running live in your browser.' },
  { icon: ShieldCheck, title: 'Keys stay yours', body: 'She never asks for a seed phrase or private key, and her tools can preview but not sign or spend.' },
]

const steps = [
  ['01', 'Talk to Rakaza', 'Ask about a coin or an idea by text or voice.'],
  ['02', 'Launch on pump.fun', 'Create your token. Launches run on devnet until the owner switches them.'],
  ['03', 'Share and track', 'Every token gets a public page with chart and curve progress.'],
  ['04', 'Control from Telegram', 'Keep an eye on things from the bot, wherever you are.'],
]

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'RakazAITerminal | Solana pump.fun launchpad with an AI agent' },
      { property: 'og:title', content: 'RakazAITerminal' },
      { property: 'og:image', content: 'https://rakazaiterminal.whop.site/brand/og-terminal.jpg' },
      { property: 'og:description', content: 'Open-source Solana pump.fun launchpad with an AI agent, Telegram control bot and live voice avatar.' },
    ],
  }),
  component: Home,
})

function Btn({ href, children, variant = 'primary' }: { href: string; children: React.ReactNode; variant?: 'primary' | 'ghost' }) {
  const base = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 px-7 font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
  const cls = variant === 'primary'
    ? 'border-ink bg-accent text-accent-ink shadow-[4px_4px_0_var(--color-pink)] hover:-translate-y-0.5'
    : 'border-ink/40 text-ink hover:border-ink'
  return <a href={href} target="_blank" rel="noreferrer" className={`${base} ${cls}`}>{children}</a>
}

function Home() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="/" className="flex items-center gap-3 font-display text-lg font-black tracking-wider uppercase">
          <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-ink">R</span>
          Rakaza
        </a>
        <nav className="flex items-center gap-6 text-sm">
          <a href="#features" className="hidden text-muted hover:text-ink sm:block">Features</a>
          <a href="#how" className="hidden text-muted hover:text-ink sm:block">How it works</a>
          <a href={GIT} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/30 px-4 font-semibold hover:border-ink">
            <Code2 className="size-4" aria-hidden /> GitHub
          </a>
        </nav>
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-[#6a3cff]">
          <div className="absolute inset-0 -z-10 opacity-30" style={{ background: 'repeating-conic-gradient(from 0deg at 50% 100%, #ffffff22 0 6deg, transparent 6deg 12deg)' }} />
          <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-24 md:pb-28">
            <p className="font-mono text-xs tracking-widest uppercase text-accent">Open source · Built on Solana</p>
            <h1 className="mt-5 font-display text-[22vw] leading-[0.85] font-black tracking-tight text-[#e4d9ff] uppercase [text-shadow:6px_6px_0_var(--color-pink)] md:text-[10rem]">
              Rakaza
            </h1>
            <p className="mt-6 font-serif text-4xl text-accent italic md:text-6xl">AI terminal for pump.fun launches</p>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
              Launch coins on Solana, talk to an AI agent with a live voice avatar, and run it all from Telegram. A 70/30 fee split, and the whole thing is open source.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a href="/terminal" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-accent px-7 font-bold text-accent-ink shadow-[4px_4px_0_var(--color-pink)] hover:-translate-y-0.5">Live launches <ArrowUpRight className="size-4" aria-hidden /></a>
              <Btn href={WEB} variant="ghost">Full playground <ArrowUpRight className="size-4" aria-hidden /></Btn>
              <Btn href={GIT} variant="ghost"><Code2 className="size-4" aria-hidden /> View source</Btn>
            </div>
          </div>
        </section>

        <div className="-rotate-1 overflow-hidden bg-pink py-3 font-display text-xl font-black tracking-wide whitespace-nowrap text-accent-ink uppercase">
          <div className="flex w-max gap-8 px-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i}>AI agent ♥ pump.fun launchpad ✦ 70/30 split ♥ Telegram bot ✦ Voice avatar ♥ No seed phrases ever ✦</span>
            ))}
          </div>
        </div>

        <section id="features" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <h2 className="max-w-2xl font-display text-4xl leading-tight font-black tracking-tight text-balance md:text-6xl">A character, not a chatbot.</h2>
          <p className="mt-5 max-w-xl text-lg text-muted">Everything you need to launch and follow a coin, in one terminal.</p>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }, i) => (
              <article key={title} className="rounded-card border-2 border-line bg-card p-7" style={{ boxShadow: `5px 5px 0 ${['var(--color-pink)', 'var(--color-accent)', 'var(--color-mint)'][i % 3]}` }}>
                <Icon className="size-7 text-accent" aria-hidden />
                <h3 className="mt-5 font-display text-xl font-extrabold">{title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="bg-accent text-accent-ink">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1fr_1.4fr] md:py-28">
            <h2 className="font-display text-4xl leading-tight font-black tracking-tight text-balance md:text-6xl">From hello to launched.</h2>
            <ol className="divide-y-2 divide-accent-ink/20 border-y-2 border-accent-ink/20">
              {steps.map(([n, t, b]) => (
                <li key={n} className="flex gap-6 py-6">
                  <span className="font-mono text-xl font-medium">{n}</span>
                  <div>
                    <h3 className="text-xl font-bold">{t}</h3>
                    <p className="mt-1 opacity-75">{b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="flex flex-col items-start gap-8 rounded-card border-2 border-ink bg-card p-8 shadow-[8px_8px_0_var(--color-mint)] md:flex-row md:items-center md:justify-between md:p-12">
            <h2 className="max-w-lg font-display text-3xl leading-tight font-black text-balance md:text-5xl">Read the code. Try her out.</h2>
            <div className="flex flex-wrap gap-4">
              <Btn href={WEB}>Playground <ArrowUpRight className="size-4" aria-hidden /></Btn>
              <Btn href={GIT} variant="ghost"><Code2 className="size-4" aria-hidden /> GitHub</Btn>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted">
          <p className="max-w-2xl">Rakaza is experimental and not financial advice. Coins can go to zero. We never ask for your seed phrase or private key.</p>
          <p className="mt-4 font-mono text-xs">© {new Date().getFullYear()} RakazAITerminal. Built on Solana.</p>
        </div>
      </footer>
    </div>
  )
}
