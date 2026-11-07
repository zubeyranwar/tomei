import { isValidElement } from 'react'
import type { MDXComponents } from 'mdx/types'

import { CodeBlock } from '@/components/site/docs/code-block'
import { Callout } from '@/components/site/mdx/callout'
import { Heading } from '@/components/site/mdx/heading'
import { Install, Preview } from '@/components/site/mdx/item'
import { Step, Steps } from '@/components/site/mdx/steps'

const shells = new Set(['bash', 'sh', 'shell', 'zsh'])

const components: MDXComponents = {
  h2: ({ children }) => (
    <Heading as="h2" className="mt-6 text-heading-4">
      {children}
    </Heading>
  ),
  h3: ({ children }) => (
    <Heading as="h3" className="mt-2 text-xl font-medium">
      {children}
    </Heading>
  ),
  p: ({ children }) => <p className="leading-relaxed text-muted-foreground">{children}</p>,
  a: ({ href, children }) => (
    <a href={href} className="text-foreground underline underline-offset-4 hover:text-signal">
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-muted-foreground">{children}</ol>
  ),
  code: ({ children }) => (
    <code className="rounded border bg-card px-1 py-0.5 font-mono text-[0.875em] text-foreground">
      {children}
    </code>
  ),
  pre: ({ children }) => {
    if (!isValidElement<{ className?: string; children?: string }>(children)) return null
    const lang = children.props.className?.replace('language-', '') ?? 'txt'
    return (
      <CodeBlock
        code={String(children.props.children ?? '')}
        filename={shells.has(lang) ? 'terminal' : lang}
        lang={shells.has(lang) ? 'bash' : lang}
      />
    )
  },
  table: ({ children }) => (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm [&_td]:px-4 [&_td]:py-2.5 [&_th]:px-4 [&_th]:py-2.5 [&_th]:font-medium [&_tr]:border-b [&_tr:last-child]:border-0">
        {children}
      </table>
    </div>
  ),
  Callout,
  Install,
  Preview,
  Step,
  Steps,
}

export function useMDXComponents(): MDXComponents {
  return components
}
