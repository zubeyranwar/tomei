import { CopyButton } from '@/components/site/copy-button'
import { highlight } from '@/lib/highlight'

export async function CodeBlock({ code, filename }: { code: string; filename: string }) {
  const html = await highlight(code, filename)

  return (
    <figure className="overflow-hidden rounded-xl border bg-card">
      <figcaption className="flex items-center justify-between gap-4 border-b py-2 pr-2 pl-4">
        <span className="font-mono text-sm">{filename}</span>
        <CopyButton value={code} />
      </figcaption>
      <div
        className="max-h-[36rem] overflow-auto py-4 pr-4 font-mono text-[0.8125rem] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  )
}
