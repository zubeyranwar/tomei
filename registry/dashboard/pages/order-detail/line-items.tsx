import { cn } from '@/lib/utils'

export type LineItem = {
  id: string
  name: React.ReactNode
  image?: React.ReactNode
  variant?: React.ReactNode
  price: number
  quantity: number
}

type LineItemsProps = {
  items: LineItem[]
  status?: React.ReactNode
  actions?: React.ReactNode
  meta?: React.ReactNode
  formatOptions?: Intl.NumberFormatOptions
  className?: string
}

export function LineItems({
  items,
  status,
  actions,
  meta,
  formatOptions = { style: 'currency', currency: 'USD' },
  className,
}: LineItemsProps) {
  const money = new Intl.NumberFormat('en-US', formatOptions)

  return (
    <section className={cn('flex flex-col gap-3', className)}>
      {(status || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-base font-semibold">{status}</div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="rounded-xl bg-card shadow-(--shadow-card)">
        {meta && (
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3 text-sm text-muted-foreground [&_svg]:size-4">
            {meta}
          </div>
        )}
        <ul className="divide-y px-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 py-3"
            >
              <span className="flex size-12 items-center justify-center overflow-hidden rounded-lg bg-muted">
                {item.image}
              </span>
              <span className="flex min-w-0 flex-col items-start gap-1.5">
                <span className="truncate text-sm font-medium">{item.name}</span>
                {item.variant && (
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs">{item.variant}</span>
                )}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums max-sm:hidden">
                {money.format(item.price)} ×
                <span className="rounded bg-muted px-1.5 text-xs text-foreground">
                  {item.quantity}
                </span>
              </span>
              <span className="w-20 text-right text-sm tabular-nums">
                {money.format(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
