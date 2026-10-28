import { cn } from '@/lib/utils'

type CardProps = {
  title: React.ReactNode
  value?: React.ReactNode
  change?: number
  action?: React.ReactNode
  legend?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function Card({ title, value, change, action, legend, className, children }: CardProps) {
  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-xl bg-card p-4 text-card-foreground shadow-(--shadow-card)',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold underline decoration-muted-foreground/50 decoration-dotted decoration-2 underline-offset-4">
          {title}
        </h3>
        {action}
      </header>
      {value !== undefined && (
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight tabular-nums">{value}</span>
          {change !== undefined && <Trend value={change} />}
        </div>
      )}
      <div className="min-h-0 flex-1">{children}</div>
      {legend && (
        <footer className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          {legend}
        </footer>
      )}
    </article>
  )
}

export function Trend({ value, className }: { value: number; className?: string }) {
  const up = value >= 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums',
        up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
        className,
      )}
    >
      <span aria-hidden>{up ? '↗' : '↘'}</span>
      <span className="sr-only">{up ? 'Up' : 'Down'}</span>
      {Math.abs(value)}%
    </span>
  )
}

export function LegendItem({
  color,
  dashed = false,
  children,
}: {
  color: string
  dashed?: boolean
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="16" height="4" aria-hidden>
        <line
          x1="2"
          y1="2"
          x2="14"
          y2="2"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={dashed ? '0.5 4' : undefined}
        />
      </svg>
      {children}
    </span>
  )
}
