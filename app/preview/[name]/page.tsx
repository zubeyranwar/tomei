import { notFound } from 'next/navigation'

import { demos } from '@/registry/__index__'
import { getItem, getItems } from '@/lib/registry'
import { cn } from '@/lib/utils'

export const dynamicParams = false

export const generateStaticParams = () => getItems().map(({ name }) => ({ name }))

export const metadata = { robots: { index: false } }

const themeScript = (scenario: string) => `(() => {
  const root = document.documentElement
  root.dataset.scenario = ${JSON.stringify(scenario)}
  const apply = (theme) => root.classList.toggle('dark', theme === 'dark')
  apply(new URLSearchParams(location.search).get('theme'))
  addEventListener('message', (e) => e.data?.type === 'tomei:theme' && apply(e.data.theme))
})()`

export default async function PreviewPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const item = getItem(name)
  if (!item) notFound()
  const { default: Demo } = await demos[name]()

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript(item.scenario) }} />
      <main
        className={cn(
          'min-h-svh bg-background text-foreground',
          item.kind === 'components' && 'grid place-items-center p-8',
        )}
      >
        <Demo />
      </main>
    </>
  )
}
