import Link from 'next/link'

import { MagneticButton } from '@/registry/landing/components/magnetic-button/magnetic-button'
import { CopyButton } from '@/components/site/copy-button'
import { registryUrl } from '@/lib/site'

export function Cta({ example }: { example?: string }) {
  const command = `pnpm dlx shadcn@latest add ${registryUrl(example ?? '<name>')}`

  return (
    <section className="px-4">
      <div className="dark flex flex-col items-center gap-10 rounded-3xl bg-background px-6 py-32 text-center text-foreground">
        <h2 className="text-heading-1 leading-[0.9] font-medium">
          Make it
          <br />
          award-worthy
        </h2>
        <div className="flex max-w-full items-center gap-4 rounded-xl border bg-card p-2 pl-4">
          <code className="truncate font-mono text-sm">{command}</code>
          <CopyButton value={command} />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <MagneticButton as={Link} href="/landing" size="lg" arrow>
            Start browsing
          </MagneticButton>
          <MagneticButton as={Link} href="/docs" size="lg" className="bg-card text-foreground">
            Read the docs
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
