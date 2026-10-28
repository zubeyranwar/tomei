import Link from 'next/link'

import { scenarios } from '@/registry/config'
import { githubUrl, site } from '@/lib/site'

export function Header() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="dark grid w-full max-w-3xl grid-cols-[1fr_auto_1fr] items-center rounded-xl bg-card p-1.5 text-foreground shadow-lg shadow-black/10">
        <div className="flex gap-1">
          {Object.entries(scenarios).map(([key, s]) => (
            <Link
              key={key}
              href={`/${key}`}
              className="rounded-lg px-3 py-2 transition-colors hover:bg-secondary max-sm:text-sm"
            >
              {s.title}
            </Link>
          ))}
        </div>
        <Link href="/" className="px-3 text-xl font-medium tracking-tight">
          {site.name.toLowerCase()}
          <span className="text-signal">*</span>
        </Link>
        <div className="flex justify-end gap-1">
          <a
            href={githubUrl}
            className="rounded-lg bg-secondary px-3 py-2 transition-colors hover:bg-muted-foreground/30 max-sm:hidden"
          >
            GitHub
          </a>
          <Link
            href="/docs"
            className="rounded-lg bg-primary px-3 py-2 text-primary-foreground transition-opacity hover:opacity-90 max-sm:text-sm"
          >
            Docs
          </Link>
        </div>
      </nav>
    </header>
  )
}
