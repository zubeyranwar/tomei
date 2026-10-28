import { notFound } from 'next/navigation'

import { demos } from '@/registry/__index__'
import { getItem, getItems } from '@/lib/registry'
import { cn } from '@/lib/utils'

export const dynamicParams = false

export const generateStaticParams = () => getItems().map(({ name }) => ({ name }))

export const metadata = { robots: { index: false } }

export default async function PreviewPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const item = getItem(name)
  if (!item) notFound()
  const { default: Demo } = await demos[name]()

  return (
    <main className={cn('min-h-svh', item.kind === 'components' && 'grid place-items-center p-8')}>
      <Demo />
    </main>
  )
}
