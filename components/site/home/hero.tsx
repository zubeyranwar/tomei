import Link from 'next/link'

import { MagneticButton } from '@/registry/landing/components/magnetic-button/magnetic-button'

const ticker = ['Free & open source', 'shadcn registry', 'Copy the prompt', 'New every week']

export function Hero() {
  return (
    <section className="flex flex-col items-center gap-10 pt-16 text-center md:pt-24">
      <h1 className="container-page text-heading-1 leading-[0.9] font-medium">
        Built to move <span className="text-signal">✱</span>
        <br />
        made to ship
      </h1>
      <p className="max-w-lg px-4 text-xl text-muted-foreground">
        Components, sections and full pages for landing sites and dashboards. One command, and the
        code is yours.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <MagneticButton as={Link} href="/landing" arrow>
          Browse landing
        </MagneticButton>
        <MagneticButton as={Link} href="/dashboard" className="bg-card text-foreground">
          Dashboard
        </MagneticButton>
      </div>
      <div className="dark mt-10 w-full overflow-hidden bg-background py-3 text-foreground">
        <div className="flex w-max animate-[marquee_30s_linear_infinite] motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} className="flex">
              {Array.from({ length: 4 }).flatMap((_, i) =>
                ticker.map((text) => (
                  <span key={`${i}-${text}`} className="flex items-center gap-6 pr-6 eyebrow">
                    {text} <span className="text-signal">✱</span>
                  </span>
                )),
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
