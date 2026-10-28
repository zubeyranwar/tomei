import Link from 'next/link'

import { ItemList } from '@/components/site/item-card'
import { getItems } from '@/lib/registry'

export function Latest() {
  return (
    <section className="px-4">
      <div className="dark rounded-3xl bg-background py-24 text-foreground">
        <div className="container-page flex flex-col gap-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-4">
              <p className="eyebrow text-muted-foreground">The registry</p>
              <h2 className="text-heading-2 leading-none">Fresh from the bench</h2>
            </div>
            <Link href="/landing" className="eyebrow text-muted-foreground hover:text-foreground">
              View all ↗
            </Link>
          </div>
          <ItemList items={getItems().slice(0, 6)} />
        </div>
      </div>
    </section>
  )
}
