'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Card, LegendItem } from '@/registry/dashboard/components/card/card'

export type BarPoint = { label: string; current: number; previous?: number }

type BarChartCardProps = {
  title: React.ReactNode
  data: BarPoint[]
  value?: React.ReactNode
  change?: number
  currentLabel?: string
  previousLabel?: string
  formatOptions?: Intl.NumberFormatOptions
  action?: React.ReactNode
  height?: number
  className?: string
}

export function BarChartCard({
  title,
  data,
  value,
  change,
  currentLabel = 'This period',
  previousLabel = 'Previous period',
  formatOptions,
  action,
  height = 200,
  className,
}: BarChartCardProps) {
  const full = new Intl.NumberFormat('en', formatOptions)
  const compact = new Intl.NumberFormat('en', { ...formatOptions, notation: 'compact' })
  const hasPrevious = data.some((d) => d.previous !== undefined)

  return (
    <Card
      title={title}
      value={value}
      change={change}
      action={action}
      className={className}
      legend={
        <>
          <LegendItem color="var(--chart-1)">{currentLabel}</LegendItem>
          {hasPrevious && <LegendItem color="var(--chart-2)">{previousLabel}</LegendItem>}
        </>
      }
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barGap={2} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
          />
          <YAxis
            width={44}
            axisLine={false}
            tickLine={false}
            tickCount={3}
            tickFormatter={(v: number) => compact.format(v)}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="rounded-lg bg-popover px-3 py-2 text-xs text-popover-foreground shadow-(--shadow-card)">
                  <p className="mb-1 text-muted-foreground">{label}</p>
                  {payload.map((p) => (
                    <p key={String(p.dataKey)} className="flex items-center gap-2 tabular-nums">
                      <span className="size-2 rounded-full" style={{ background: p.color }} />
                      {full.format(Number(p.value))}
                    </p>
                  ))}
                </div>
              ) : null
            }
          />
          <Bar dataKey="current" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={18} />
          {hasPrevious && (
            <Bar dataKey="previous" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={18} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
