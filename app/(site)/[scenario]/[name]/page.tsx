import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { kindTitles, scenarios } from '@/registry/config'
import { Badge } from '@/components/site/badge'
import { CopyButton } from '@/components/site/copy-button'
import { Callout } from '@/components/site/docs/callout'
import { CodeBlock } from '@/components/site/docs/code-block'
import { Sidebar } from '@/components/site/docs/sidebar'
import { Toc } from '@/components/site/docs/toc'
import { InstallCommand } from '@/components/site/install-command'
import { PreviewFrame } from '@/components/site/preview-frame'
import {
  getDemo,
  getItem,
  getItems,
  getPrompt,
  getSiblings,
  getSource,
  installDir,
} from '@/lib/registry'
import { registryUrl, site } from '@/lib/site'

export const dynamicParams = false

export const generateStaticParams = () =>
  getItems().map(({ scenario, name }) => ({ scenario, name }))

type Props = { params: Promise<{ scenario: string; name: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = getItem((await params).name)
  return { title: item?.title, description: item?.description }
}

const sections = [
  { id: 'preview', label: 'Preview' },
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'source', label: 'Source code' },
]

const code = (text: string) => (
  <code className="rounded border bg-card px-1 py-0.5 font-mono text-[0.875em]">{text}</code>
)

export default async function ItemPage({ params }: Props) {
  const { scenario, name } = await params
  const item = getItem(name)
  if (!item || item.scenario !== scenario) notFound()

  const [files, demo, prompt] = await Promise.all([getSource(item), getDemo(item), getPrompt(item)])
  const { prev, next } = getSiblings(item)

  return (
    <div className="container-page grid gap-12 pt-8 lg:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[13rem_minmax(0,1fr)_11rem]">
      <aside className="max-lg:hidden">
        <Sidebar active={item.name} />
      </aside>

      <article className="flex min-w-0 flex-col gap-16">
        <header className="flex flex-col gap-5">
          <Link
            href={`/${item.scenario}`}
            className="w-fit eyebrow text-muted-foreground hover:text-foreground"
          >
            ← {scenarios[item.scenario].title}
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://github.com/${site.repo.split('/')[0]}.png?size=64`}
              alt=""
              className="size-7 rounded-full bg-card"
            />
            <span className="text-foreground">{site.author}</span>
            {item.date && (
              <>
                <span>·</span>
                <time dateTime={item.date}>
                  {new Date(item.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </time>
              </>
            )}
            <span>·</span>
            <Badge>{kindTitles[item.kind]}</Badge>
            {item.categories?.map((c) => (
              <Badge key={c}>{c}</Badge>
            ))}
          </div>
          <h1 className="text-heading-2 leading-none font-medium">{item.title}</h1>
          <p className="max-w-2xl text-xl text-muted-foreground">{item.description}</p>
          <div className="flex gap-2">
            <a
              href={`/preview/${item.name}`}
              target="_blank"
              className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90"
            >
              Live demo ↗
            </a>
            <CopyButton
              value={prompt}
              label="Copy prompt"
              className="rounded-lg px-3 py-2 font-sans text-sm tracking-normal normal-case"
            />
          </div>
        </header>

        <section id="preview" className="scroll-mt-28">
          <PreviewFrame
            name={item.name}
            title={item.title}
            interactive
            className="aspect-[16/10] rounded-2xl border"
          />
        </section>

        <section id="installation" className="flex scroll-mt-28 flex-col gap-5">
          <h2 className="text-heading-4">Installation</h2>
          <p className="text-muted-foreground">
            Run the shadcn CLI in a project that already has {code('components.json')}.
          </p>
          <InstallCommand
            url={registryUrl(item.name)}
            namespaced={`${site.namespace}/${item.name}`}
          />
          <Callout
            items={[
              ...(item.dependencies ?? []).map((dep) => <>Installs {code(dep)} from npm.</>),
              ...(item.registryDependencies ?? []).map((dep) => <>Pulls in {code(dep)}.</>),
              <>Files land in {code(installDir(item))}.</>,
            ]}
          />
          {item.dependencies?.length ? (
            <>
              <p className="text-muted-foreground">
                Installing by hand? Add the dependencies, then copy the source code below.
              </p>
              <CodeBlock code={`pnpm add ${item.dependencies.join(' ')}`} filename="terminal.sh" />
            </>
          ) : null}
        </section>

        <section id="usage" className="flex scroll-mt-28 flex-col gap-5">
          <h2 className="text-heading-4">Usage</h2>
          <CodeBlock code={demo} filename="example.tsx" />
        </section>

        <section id="source" className="flex scroll-mt-28 flex-col gap-5">
          <h2 className="text-heading-4">Source code</h2>
          {files.map((file) => (
            <CodeBlock key={file.path} code={file.code} filename={file.path} />
          ))}
        </section>

        <nav className="grid grid-cols-2 gap-3 border-t pt-8">
          {prev ? (
            <Link
              href={`/${prev.scenario}/${prev.name}`}
              className="rounded-xl bg-card p-4 hover:bg-secondary"
            >
              <span className="eyebrow text-muted-foreground">← Previous</span>
              <p className="mt-1 text-lg">{prev.title}</p>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/${next.scenario}/${next.name}`}
              className="rounded-xl bg-card p-4 text-right hover:bg-secondary"
            >
              <span className="eyebrow text-muted-foreground">Next →</span>
              <p className="mt-1 text-lg">{next.title}</p>
            </Link>
          )}
        </nav>
      </article>

      <aside className="max-xl:hidden">
        <Toc sections={sections} />
      </aside>
    </div>
  )
}
