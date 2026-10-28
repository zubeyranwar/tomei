'use client'

import { useState } from 'react'

import { CopyButton } from '@/components/site/copy-button'
import { cn } from '@/lib/utils'

const runners = {
  pnpm: 'pnpm dlx',
  npm: 'npx',
  yarn: 'yarn dlx',
  bun: 'bunx --bun',
} as const

type Runner = keyof typeof runners

export function InstallCommand({ url, namespaced }: { url: string; namespaced: string }) {
  const [runner, setRunner] = useState<Runner>('pnpm')
  const [source, setSource] = useState<'url' | 'namespace'>('url')
  const command = `${runners[runner]} shadcn@latest add ${source === 'url' ? url : namespaced}`

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-2 border-b p-2">
        <div className="flex gap-1">
          {(Object.keys(runners) as Runner[]).map((r) => (
            <Tab key={r} active={runner === r} onClick={() => setRunner(r)}>
              {r}
            </Tab>
          ))}
        </div>
        <div className="flex gap-1">
          <Tab active={source === 'url'} onClick={() => setSource('url')}>
            url
          </Tab>
          <Tab active={source === 'namespace'} onClick={() => setSource('namespace')}>
            @tomei
          </Tab>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 p-4">
        <code className="font-mono text-sm break-all">{command}</code>
        <CopyButton value={command} />
      </div>
    </div>
  )
}

export function Tab({
  active,
  className,
  ...props
}: React.ComponentProps<'button'> & { active: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-md px-2.5 py-1.5 eyebrow transition-colors',
        active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      {...props}
    />
  )
}
