import Link from 'next/link'

import { kindTitles, scenarios, type Scenario } from '@/registry/config'
import { getItems } from '@/lib/registry'
import { cn } from '@/lib/utils'

export function Sidebar({ active }: { active: string }) {
  return (
    <nav className="sticky top-28 flex max-h-[calc(100svh-8rem)] flex-col gap-6 overflow-y-auto pr-4 pb-8">
      {(Object.keys(scenarios) as Scenario[]).map((scenario) => {
        const items = getItems(scenario)
        return (
          <div key={scenario} className="flex flex-col gap-3">
            <Link href={`/${scenario}`} className="font-medium">
              {scenarios[scenario].title}
            </Link>
            {scenarios[scenario].kinds.map((kind) => {
              const list = items.filter((i) => i.kind === kind)
              if (!list.length) return null
              return (
                <div key={kind} className="flex flex-col gap-1">
                  <p className="mb-1 eyebrow text-muted-foreground">{kindTitles[kind]}</p>
                  {list.map((item) => (
                    <Link
                      key={item.name}
                      href={`/${item.scenario}/${item.name}`}
                      className={cn(
                        'rounded-md px-2 py-1 text-[0.9375rem] transition-colors',
                        item.name === active
                          ? 'bg-secondary text-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}
