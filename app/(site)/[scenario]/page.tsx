import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { kindTitles, scenarios, type Scenario } from '@/registry/config'
import { ItemList } from '@/components/site/item-card'
import { getItems } from '@/lib/registry'

export const dynamicParams = false

export const generateStaticParams = () => Object.keys(scenarios).map((scenario) => ({ scenario }))

type Props = { params: Promise<{ scenario: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { scenario } = await params
  const s = scenarios[scenario as Scenario]
  return { title: s?.title, description: s?.description }
}

export default async function ScenarioPage({ params }: Props) {
  const { scenario } = (await params) as { scenario: Scenario }
  const s = scenarios[scenario]
  if (!s) notFound()
  const items = getItems(scenario)

  return (
    <div className="container-page">
      <section className="flex flex-col gap-6 pt-16 pb-16">
        <p className="eyebrow text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </p>
        <h1 className="text-heading-1 leading-[0.9] font-medium">{s.title}</h1>
        <p className="max-w-xl text-xl text-muted-foreground">{s.description}</p>
      </section>

      <div className="flex flex-col gap-16">
        {s.kinds.map((kind) => (
          <section key={kind} id={kind}>
            <h2 className="mb-4 eyebrow text-muted-foreground">{kindTitles[kind]}</h2>
            <ItemList items={items.filter((i) => i.kind === kind)} />
          </section>
        ))}
      </div>
    </div>
  )
}
