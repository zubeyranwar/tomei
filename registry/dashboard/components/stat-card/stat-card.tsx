import { cn } from '@/lib/utils'

type StatCardProps = {
  label: React.ReactNode
  value: React.ReactNode
  hint?: React.ReactNode
  info?: string
  change?: number
  spark?: number[]
  className?: string
}

export function StatCard({ label, value, hint, info, change, spark, className }: StatCardProps) {
  return (
    <article
      className={cn(
        'relative isolate flex flex-col gap-3 overflow-hidden rounded-xl bg-card p-4 text-card-foreground shadow-(--shadow-card)',
        className,
      )}
    >
      {spark && <Spark values={spark} />}
      <header className="flex items-center gap-1.5 text-[11px] leading-none font-medium tracking-wider text-muted-foreground uppercase">
        <span className="truncate">{label}</span>
        {info && (
          <span title={info} className="flex cursor-help">
            <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-3.5">
              <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.25" />
              <path
                d="M8 7.25v3.5M8 5.25v.01"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="sr-only">{info}</span>
          </span>
        )}
      </header>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="flex items-baseline gap-2">
          <span className="text-2xl leading-none font-medium tracking-tight tabular-nums">
            {value}
          </span>
          {change !== undefined && (
            <span
              className={cn(
                'text-xs font-semibold whitespace-nowrap tabular-nums',
                change >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              {change >= 0 ? '↗' : '↘'} {Math.abs(change)}%
            </span>
          )}
        </span>
        {hint && <span className="truncate text-xs text-muted-foreground">{hint}</span>}
      </div>
    </article>
  )
}

function Spark({ values }: { values: number[] }) {
  const max = Math.max(...values, 1)
  return (
    <span
      aria-hidden
      className="absolute inset-x-0 bottom-0 -z-10 flex h-3/5 items-end gap-0.5 px-2"
    >
      {values.map((v, i) => (
        <span
          key={i}
          className="flex-1 rounded-t-[2px] bg-chart-1"
          style={{ height: `${(v / max) * 100}%`, opacity: 0.15 + (i / values.length) * 0.35 }}
        />
      ))}
    </span>
  )
}
