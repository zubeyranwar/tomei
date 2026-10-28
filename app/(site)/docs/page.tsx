import type { Metadata } from 'next'

import { CodeBlock } from '@/components/site/docs/code-block'
import { site } from '@/lib/site'

export const metadata: Metadata = { title: 'Docs' }

const componentsJson = `{
  "registries": {
    "${site.namespace}": "${site.url}${site.registryPath}/{name}.json"
  }
}`

export default function DocsPage() {
  return (
    <article className="container-page flex max-w-3xl flex-col gap-8 pt-16">
      <h1 className="text-heading-2 leading-none font-medium">Getting started</h1>
      <p className="text-lg text-muted-foreground">
        Every item is a shadcn registry item. You need a React project with Tailwind CSS v4 and{' '}
        <code className="font-mono">npx shadcn@latest init</code> already run.
      </p>

      <h2 className="text-heading-4">Install by URL</h2>
      <p className="text-muted-foreground">
        Works anywhere, no setup. Copy the command from any item page.
      </p>

      <h2 className="text-heading-4">Install by namespace</h2>
      <p className="text-muted-foreground">
        Add the registry to your <code className="font-mono">components.json</code>, then run{' '}
        <code className="font-mono">npx shadcn@latest add {site.namespace}/&lt;name&gt;</code>.
      </p>
      <CodeBlock code={componentsJson} filename="components.json" />

      <h2 className="text-heading-4">Copy the prompt</h2>
      <p className="text-muted-foreground">
        Not using shadcn? Each item has a “Copy prompt” button that hands your AI assistant the full
        source and setup steps.
      </p>
    </article>
  )
}
