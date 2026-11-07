import { useEffect, useState } from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import { Reveal } from './Reveal'

const ORIGIN = 'https://rakaza-ai-terminal.vercel.app'
type Post = { id: string; category: string; kind: string; body: string; createdAt: string; author: { handle: string; name: string; avatar?: string; verified?: boolean }; likes: number; replies: number; token?: { symbol?: string; name?: string } | null }

export function Community() {
  const [posts, setPosts] = useState<Post[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  useEffect(() => {
    fetch(`${ORIGIN}/api/public/community`).then((r) => r.json()).then((d) => setPosts(d.posts ?? [])).catch((e) => setErr(String(e.message || e)))
  }, [])
  if (err) return <p className="text-muted">Couldn't load the community ({err}).</p>
  if (!posts) return <p className="py-10 text-muted">Loading posts…</p>
  if (!posts.length) return <p className="text-muted">No posts yet.</p>
  return (
    <ul className="grid gap-4">
      {posts.map((p, i) => (
        <li key={p.id}>
          <Reveal delay={(i % 4) * 60}>
            <article className="rounded-card border-2 border-line bg-card p-5">
              <header className="flex items-center gap-3">
                <img src={p.author.avatar ? ORIGIN + p.author.avatar : undefined} alt="" className="size-10 rounded-full bg-line object-cover" />
                <div className="min-w-0"><p className="truncate font-bold">{p.author.name}{p.author.verified ? ' ✓' : ''} <span className="text-sm font-normal text-muted">@{p.author.handle}</span></p>
                  <p className="text-xs text-muted">{new Date(p.createdAt).toLocaleString()} · {p.category}</p></div>
              </header>
              <p className="mt-3 whitespace-pre-wrap break-words">{p.body}</p>
              <footer className="mt-3 flex gap-5 text-sm text-muted"><span className="inline-flex items-center gap-1"><Heart className="size-4" />{p.likes}</span><span className="inline-flex items-center gap-1"><MessageCircle className="size-4" />{p.replies}</span></footer>
            </article>
          </Reveal>
        </li>
      ))}
    </ul>
  )
}
