'use client'

import { useId } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, LegendItem } from '@/registry/dashboard/components/card/card'

export type LinePoint = { label: string; current: number; previous?: number }

type LineChartCardProps = {
  title: React.ReactNode
  data: LinePoint[]
  value?: React.ReactNode
  change?: number
  currentLabel?: string
  previousLabel?: string
  formatOptions?: Intl.NumberFormatOptions
  action?: React.ReactNode
  height?: number
  className?: string
}

export function LineChartCard({
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
}: LineChartCardProps) {
  const gradient = `fill-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
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
          {hasPrevious && (
            <LegendItem color="var(--chart-2)" dashed>
              {previousLabel}
            </LegendItem>
          )}
        </>
      }
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            minTickGap={32}
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
            cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="rounded-lg bg-popover px-3 py-2 text-xs text-popover-foreground shadow-(--shadow-card)">
                  <p className="mb-1 text-muted-foreground">{label}</p>
                  {payload.map((p) => (
                    <p key={String(p.dataKey)} className="flex items-center gap-2 tabular-nums">
                      <span
                        className="size-2 rounded-full"
                        style={{
                          background: p.dataKey === 'current' ? 'var(--chart-1)' : 'var(--chart-2)',
                        }}
                      />
                      {full.format(Number(p.value))}
                    </p>
                  ))}
                </div>
              ) : null
            }
          />
          {hasPrevious && (
            <Area
              type="monotone"
              dataKey="previous"
              stroke="var(--chart-2)"
              strokeWidth={2.5}
              strokeDasharray="0.5 6"
              strokeLinecap="round"
              fill="none"
              dot={false}
              activeDot={false}
            />
          )}
          <Area
            type="monotone"
            dataKey="current"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            fill={`url(#${gradient})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--chart-1)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
