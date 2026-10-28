import Link from 'next/link'

import { kindTitles } from '@/registry/config'
import type { IndexedItem } from '@/registry/define'
import { Badge } from '@/components/site/badge'
import { PreviewFrame } from '@/components/site/preview-frame'
import { Since } from '@/components/site/since'

export function ItemCard({ item }: { item: IndexedItem }) {
  return (
    <Link
      href={`/${item.scenario}/${item.name}`}
      className="group grid gap-6 rounded-2xl bg-card p-4 transition-colors hover:bg-secondary md:grid-cols-[1fr_minmax(0,28rem)] md:p-6"
    >
      <div className="flex flex-col gap-6 p-2 md:p-8">
        <div className="flex gap-1">
          {item.date && (
            <Badge tone="signal">
              <Since date={item.date} />
            </Badge>
          )}
          <Badge>{kindTitles[item.kind]}</Badge>
        </div>
        <h3 className="text-heading-3 leading-none">{item.title}</h3>
        {item.categories?.length ? (
          <p className="mt-auto eyebrow text-muted-foreground">{item.categories.join(' & ')}</p>
        ) : null}
      </div>
      <PreviewFrame
        name={item.name}
        title={item.title}
        className="aspect-[16/10] rounded-xl transition-transform duration-700 ease-(--ease-expo) group-hover:scale-[0.98]"
      />
    </Link>
  )
}

export function ItemList({ items }: { items: IndexedItem[] }) {
  if (!items.length)
    return <p className="py-24 text-center eyebrow text-muted-foreground">Nothing here yet.</p>
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <ItemCard key={item.name} item={item} />
      ))}
    </div>
  )
}
