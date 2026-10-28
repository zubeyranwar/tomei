import Link from 'next/link'

import { scenarios } from '@/registry/config'
import { githubUrl, site } from '@/lib/site'

const columns = [
  {
    title: 'Registry',
    links: Object.entries(scenarios).map(([key, s]) => ({ label: s.title, href: `/${key}` })),
  },
  {
    title: 'Resources',
    links: [
      { label: 'Docs', href: '/docs' },
      { label: 'Registry JSON', href: `${site.registryPath}/registry.json` },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'GitHub', href: githubUrl },
      { label: 'Contribute', href: `${githubUrl}/blob/main/AGENT.md` },
      { label: site.author, href: site.authorUrl },
    ],
  },
]

export function Footer() {
  return (
    <footer className="container-page overflow-hidden pt-24">
      <div className="grid gap-12 border-t pt-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <p className="max-w-xs text-lg text-muted-foreground">{site.description}</p>
        {columns.map((column) => (
          <div key={column.title} className="flex flex-col gap-4">
            <h3 className="text-xl">{column.title}</h3>
            <ul className="flex flex-col gap-1.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p
        aria-hidden
        className="mt-16 -mb-[0.22em] text-center text-[26vw] leading-none font-medium tracking-[-0.06em] select-none"
      >
        {site.name.toLowerCase()}
      </p>
    </footer>
  )
}
