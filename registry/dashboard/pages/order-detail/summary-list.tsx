import { cn } from '@/lib/utils'

export type SummaryRow = {
  label: React.ReactNode
  detail?: React.ReactNode
  value: React.ReactNode
}

type SummaryListProps = {
  rows: SummaryRow[]
  total?: { label: React.ReactNode; value: React.ReactNode }
  footer?: SummaryRow[]
  className?: string
}

function Row({ label, detail, value, strong }: SummaryRow & { strong?: boolean }) {
  return (
    <div
      className={cn(
        'grid grid-cols-[1fr_auto_6rem] items-center gap-4 py-2 text-sm',
        strong && 'font-semibold',
      )}
    >
      <span>{label}</span>
      <span className="text-right text-muted-foreground">{detail}</span>
      <span className="text-right tabular-nums">{value}</span>
    </div>
  )
}

export function SummaryList({ rows, total, footer, className }: SummaryListProps) {
  return (
    <div className={cn('rounded-xl bg-muted', className)}>
      <div className="rounded-xl bg-card px-4 py-2 shadow-(--shadow-card)">
        {rows.map((row, i) => (
          <Row key={i} {...row} />
        ))}
        {total && (
          <div className="mt-1 border-t pt-1">
            <Row label={total.label} value={total.value} strong />
          </div>
        )}
      </div>
      {footer?.length ? (
        <div className="px-4 py-2">
          {footer.map((row, i) => (
            <Row key={i} {...row} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
