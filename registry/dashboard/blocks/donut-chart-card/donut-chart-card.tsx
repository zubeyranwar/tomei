'use client'

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { Card, Trend } from '@/registry/dashboard/components/card/card'

export type DonutSlice = { name: string; value: number; change?: number; color?: string }

type DonutChartCardProps = {
  title: React.ReactNode
  data: DonutSlice[]
  change?: number
  formatOptions?: Intl.NumberFormatOptions
  maxLegendItems?: number
  action?: React.ReactNode
  className?: string
}

const palette = [
  'var(--chart-1)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-2)',
]

export function DonutChartCard({
  title,
  data,
  change,
  formatOptions,
  maxLegendItems = 4,
  action,
  className,
}: DonutChartCardProps) {
  const compact = new Intl.NumberFormat('en', { ...formatOptions, notation: 'compact' })
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const slices = data.map((d, i) => ({ ...d, color: d.color ?? palette[i % palette.length] }))
  const hidden = slices.length - maxLegendItems

  return (
    <Card title={title} action={action} className={className}>
      <div className="flex items-center gap-6">
        <div className="relative size-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                innerRadius="68%"
                outerRadius="100%"
                paddingAngle={2}
                cornerRadius={3}
                stroke="none"
                isAnimationActive={false}
              >
                {slices.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums">{compact.format(total)}</span>
            {change !== undefined && <Trend value={change} />}
          </div>
        </div>
        <ul className="flex min-w-0 flex-1 flex-col gap-2 text-xs">
          {slices.slice(0, maxLegendItems).map((s) => (
            <li key={s.name} className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} />
              <span className="truncate">{s.name}</span>
              <span className="ml-auto font-semibold tabular-nums">{compact.format(s.value)}</span>
              {s.change !== undefined && <Trend value={s.change} className="w-10 justify-end" />}
            </li>
          ))}
          {hidden > 0 && <li className="pl-4.5 text-muted-foreground">+{hidden} more</li>}
        </ul>
      </div>
    </Card>
  )
}
