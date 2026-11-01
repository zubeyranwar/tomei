import { cn } from '@/lib/utils'

export type Totals = {
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
}

type TotalsCardProps = {
  totals: Totals
  before: Totals
  count: number
  paid: number
  discountLabel?: string
  taxRate: number
  money: Intl.NumberFormat
  children?: React.ReactNode
}

export function computeTotals(
  items: { price: number; quantity: number }[],
  discountPct: number,
  shipping: number,
  taxRate: number,
): Totals {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discount = (subtotal * Math.min(100, Math.max(0, discountPct || 0))) / 100
  const ship = Math.max(0, shipping || 0)
  const tax = (subtotal - discount) * taxRate
  return { subtotal, discount, shipping: ship, tax, total: subtotal - discount + ship + tax }
}

function Row({
  label,
  detail,
  value,
  was,
  strong,
}: {
  label: React.ReactNode
  detail?: React.ReactNode
  value: string
  was?: string
  strong?: boolean
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-[1fr_auto_7rem] items-baseline gap-4 py-2 text-sm',
        strong && 'font-semibold',
      )}
    >
      <span>{label}</span>
      <span className="text-right text-muted-foreground">{detail}</span>
      <span className="flex flex-col items-end tabular-nums">
        {value}
        {was && was !== value && (
          <span className="text-xs font-normal text-muted-foreground line-through">{was}</span>
        )}
      </span>
    </div>
  )
}

export function TotalsCard({
  totals,
  before,
  count,
  paid,
  discountLabel,
  taxRate,
  money,
  children,
}: TotalsCardProps) {
  const f = (n: number) => money.format(n)
  const balance = Math.round((totals.total - paid) * 100) / 100

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold">Payment</h2>
      <div className="rounded-xl bg-muted">
        <div className="rounded-xl bg-card px-4 py-2 shadow-(--shadow-card)">
          <Row
            label="Subtotal"
            detail={`${count} item${count === 1 ? '' : 's'}`}
            value={f(totals.subtotal)}
            was={f(before.subtotal)}
          />
          {totals.discount > 0 && (
            <Row
              label="Discount"
              detail={discountLabel}
              value={`−${f(totals.discount)}`}
              was={before.discount ? `−${f(before.discount)}` : undefined}
            />
          )}
          <Row label="Shipping" value={f(totals.shipping)} was={f(before.shipping)} />
          <Row
            label="Tax"
            detail={`${Math.round(taxRate * 1000) / 10}%`}
            value={f(totals.tax)}
            was={f(before.tax)}
          />
          <div className="mt-1 border-t pt-1">
            <Row label="Total" value={f(totals.total)} was={f(before.total)} strong />
          </div>
        </div>
        <div className="px-4 py-2">
          <Row label="Paid by customer" value={f(paid)} />
          <Row
            strong
            label={balance > 0 ? 'Amount to collect' : balance < 0 ? 'Refund owed' : 'Balance'}
            value={f(Math.abs(balance))}
          />
          {children && <div className="border-t py-3">{children}</div>}
        </div>
      </div>
    </section>
  )
}
