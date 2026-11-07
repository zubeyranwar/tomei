import { cn } from '@/lib/utils'

const tones = {
  note: 'border-border bg-secondary/60',
  tip: 'border-signal/40 bg-signal/5',
  warn: 'border-amber-500/40 bg-amber-500/5',
}

export function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: keyof typeof tones
  title?: string
  children: React.ReactNode
}) {
  return (
    <aside
      className={cn(
        'flex flex-col gap-1 rounded-xl border px-5 py-4 [&_p]:m-0 [&_p]:text-muted-foreground',
        tones[type],
      )}
    >
      {title && <p className="font-medium !text-foreground">{title}</p>}
      {children}
    </aside>
  )
}
