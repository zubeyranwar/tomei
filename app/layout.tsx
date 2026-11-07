import type { Metadata } from '@farm.js/core'

import { site } from '@/lib/site'

import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s — ${site.name}` },
  description: site.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
