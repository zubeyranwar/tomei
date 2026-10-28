import Link from 'next/link'

import { scenarios, kindTitles, type Scenario } from '@/registry/config'
import { getItems } from '@/lib/registry'
import { cn } from '@/lib/utils'

export function Scenarios() {
  return (
    <section className="container-page grid gap-3 md:grid-cols-2">
      {(Object.keys(scenarios) as Scenario[]).map((key, i) => {
        const s = scenarios[key]
        const items = getItems(key)
        return (
          <Link
            key={key}
            href={`/${key}`}
            className={cn(
              'group flex min-h-[28rem] flex-col justify-between rounded-2xl bg-card p-8 text-foreground md:p-12',
              i === 1 && 'dark',
            )}
          >
            <span className="eyebrow text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
            <div className="flex flex-col gap-6">
              <h2 className="text-heading-2 leading-none transition-transform duration-700 ease-(--ease-expo) group-hover:translate-x-2">
                {s.title} <span className="text-signal">↗</span>
              </h2>
              <p className="max-w-sm text-lg text-muted-foreground">{s.description}</p>
              <div className="flex flex-wrap gap-1">
                {s.kinds.map((kind) => (
                  <span key={kind} className="rounded-[0.2rem] bg-secondary px-1.5 py-0.5 eyebrow">
                    {items.filter((item) => item.kind === kind).length} {kindTitles[kind]}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        )
      })}
    </section>
  )
}
