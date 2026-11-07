import { createFileRoute } from '@tanstack/react-router'
import { Explorer } from '../components/Explorer'

export const Route = createFileRoute('/terminal')({
  head: () => ({ meta: [
    { title: 'Rakaza Terminal | Live Solana launches in 3D' },
    { name: 'description', content: 'Live pump.fun launches in 3D, a talking Rakaza avatar, a try-it-yourself terminal, promo video and the trending Solana market.' },
    { property: 'og:title', content: 'Rakaza Terminal: live Solana launches in 3D' },
    { property: 'og:description', content: 'Fly through live launches, meet Rakaza in 3D, try the terminal, watch the promo.' },
    { property: 'og:url', content: 'https://rakazaiterminal.whop.site/terminal' },
    { name: 'twitter:title', content: 'Rakaza Terminal: live Solana launches in 3D' },
    { name: 'twitter:description', content: 'Fly through live launches, meet Rakaza in 3D, try the terminal, watch the promo.' },
  ] }),
  component: Explorer,
})
