import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'RakazAITerminal' },
      { property: 'og:image', content: 'https://rakazaiterminal.whop.site/brand/og-terminal.jpg' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'Rakaza, a violet-haired anime VTuber, waving beside a gold rocket coin orbited by token badges' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: 'https://rakazaiterminal.whop.site/brand/og-terminal.jpg' },
      { title: "RakazAITerminal | Solana pump.fun launchpad with an AI agent" },
      { name: "description", content: "Open-source Solana pump.fun launchpad with an AI agent, a 70/30 fee split, a Telegram control bot and a live voice avatar." },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@100..150,700..900&family=Geist+Mono:wght@400;500&family=Geist:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap' },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
