import type { Metadata } from '@farm.js/core'
import { notFound } from '@farm.js/core/navigation'

import { Sidebar } from '@/components/site/docs/sidebar'
import { Toc } from '@/components/site/docs/toc'
import { mdxComponents } from '@/mdx-components'
import { docHref, getDocs, getDocSource, getHeadings } from '@/lib/docs'

export const dynamic = 'force-static'

export const generateStaticParams = () =>
  getDocs().map(({ slug }) => ({ slug: slug === 'index' ? [] : [slug] }))

type Props = { params: { slug?: string } }

const findDoc = async ({ params }: Props) => {
  const slug = (await params).slug || 'index'
  return getDocs().find((d) => d.slug === slug)
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const doc = await findDoc(props)
  return { title: doc?.title, description: doc?.description }
}

export default async function DocPage(props: Props) {
  const doc = await findDoc(props)
  if (!doc) notFound()

  const { default: Content } = await import(`../../../../content/docs/${doc.slug}.mdx`)
  const headings = getHeadings(getDocSource(doc.slug))

  return (
    <div className="container-page grid gap-12 pt-8 lg:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[13rem_minmax(0,1fr)_11rem]">
      <aside className="max-lg:hidden">
        <Sidebar active={docHref(doc.slug)} />
      </aside>

      <article className="flex min-w-0 flex-col gap-5 pb-16">
        <header className="flex flex-col gap-4 pb-4">
          <h1 className="text-heading-2 leading-none font-medium">{doc.title}</h1>
          {doc.description && (
            <p className="max-w-2xl text-xl text-muted-foreground">{doc.description}</p>
          )}
        </header>
        <Content components={mdxComponents} />
      </article>

      <aside className="max-xl:hidden">
        {headings.length > 0 && <Toc sections={headings.map(({ id, label }) => ({ id, label }))} />}
      </aside>
    </div>
  )
}
