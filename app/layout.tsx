import type { Metadata } from 'next'

import { site } from '@/lib/site'

import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s — ${site.name}` },
  description: site.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/PPNeueMontreal-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/PPNeueMontrealMono-Book.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
