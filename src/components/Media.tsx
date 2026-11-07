import { useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { Reveal } from './Reveal'

const MEMES = [
  ['gm', 'GM, no seed phrases today'], ['never-share', 'Never share your seed phrase'], ['devnet-first', 'Devnet first, always'], ['read-the-chart', 'I read the chart so you stay calm'],
  ['dyor', 'DYOR, I will wait'], ['3am', 'Still launching at 3am'], ['keep-100', 'Self launch: you keep 100%'], ['seventy-thirty', 'Sponsored launch: 70% you, 30% me'],
]
const SONGS = [['rakaza-song-1.mp3', 'Rakaza Launch'], ['rakaza-song-2.mp3', 'Rakaza Launch v2']]

function Song({ file, title }: { file: string; title: string }) {
  const a = useRef<HTMLAudioElement>(null)
  const [on, setOn] = useState(false)
  return (
    <div className="flex items-center gap-4 rounded-card border-2 border-line bg-card p-4">
      <button onClick={() => { const el = a.current; if (!el) return; if (el.paused) { void el.play(); setOn(true) } else { el.pause(); setOn(false) } }} aria-label={on ? `Pause ${title}` : `Play ${title}`} className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-ink bg-accent text-accent-ink">
        {on ? <Pause className="size-5" /> : <Play className="size-5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{title}</p>
        <div className="mt-2 flex h-6 items-end gap-0.5" aria-hidden>
          {Array.from({ length: 28 }).map((_, i) => <span key={i} className="w-full rounded-sm bg-mint" style={{ height: `${30 + ((i * 37) % 70)}%`, transformOrigin: 'bottom', animation: on ? `bar ${0.5 + (i % 5) * 0.12}s ${i * 30}ms ease-in-out infinite alternate` : undefined, opacity: on ? 1 : 0.35 }} />)}
        </div>
      </div>
      <audio ref={a} src={`/media/${file}`} preload="none" onEnded={() => setOn(false)} />
    </div>
  )
}

export function Media() {
  const [big, setBig] = useState<string | null>(null)
  return (
    <div className="space-y-14">
      <Reveal>
        <h2 className="font-display text-3xl font-black">Promo</h2>
        <p className="mt-1 text-muted">15 seconds on what Rakaza does.</p>
        <video controls playsInline preload="metadata" poster="/media/rakaza-promo-16x9-poster.jpg" className="mt-4 aspect-video w-full rounded-card border-2 border-ink bg-black shadow-[8px_8px_0_var(--color-pink)]">
          <source src="/media/rakaza-promo-16x9.mp4" type="video/mp4" />
        </video>
      </Reveal>
      <section>
        <Reveal><h2 className="font-display text-3xl font-black">Rakaza songs</h2><p className="mt-1 text-muted">Tap play. Songs from the project, made for Rakaza.</p></Reveal>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">{SONGS.map(([f, t], i) => <Reveal key={f} delay={i * 100}><Song file={f} title={t} /></Reveal>)}</div>
      </section>
      <section>
        <Reveal><h2 className="font-display text-3xl font-black">Meme wall</h2><p className="mt-1 text-muted">Same character, same style in every scene. Tap one to enlarge.</p></Reveal>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {MEMES.map(([id, cap], i) => (
            <Reveal key={id} delay={(i % 4) * 80}>
              <button onClick={() => setBig(id)} className="group block w-full overflow-hidden rounded-card border-2 border-line bg-card text-left transition hover:-translate-y-1 hover:rotate-1 hover:border-ink" aria-label={cap}>
                <img src={`/memes/${id}.jpg`} alt={cap} loading="lazy" className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
              </button>
            </Reveal>
          ))}
        </div>
      </section>
      {big && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={() => setBig(null)} role="dialog" aria-label="Meme">
          <img src={`/memes/${big}.jpg`} alt="" className="max-h-[88vh] max-w-full rounded-card border-2 border-ink" />
        </div>
      )}
    </div>
  )
}
