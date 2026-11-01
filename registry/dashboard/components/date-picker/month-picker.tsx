'use client'

import { useEffect, useRef, useState } from 'react'
import { CalendarDays } from 'lucide-react'

import { cn } from '@/lib/utils'

import {
  FooterButton,
  NavButton,
  Picker,
  PickerFooter,
  type PickerBaseProps,
  usePickerClose,
} from './picker'
import { formatMonthYear, fullMonth, label, shortMonths, type PickerLabels } from './locale'

type MonthPickerProps = PickerBaseProps & {
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
}

const pad = (n: number) => String(n).padStart(2, '0')
const key = (year: number, month: number) => `${year}-${pad(month + 1)}`

export function formatMonth(value: string, locale?: string) {
  const [y, m] = value.split('-').map(Number)
  return y && m ? formatMonthYear(new Date(y, m - 1, 1), locale) : value
}

export function MonthPicker({
  value,
  onChange,
  min,
  max,
  placeholder,
  locale,
  labels,
  ...props
}: MonthPickerProps) {
  return (
    <Picker
      icon={<CalendarDays />}
      text={value ? formatMonth(value, locale) : ''}
      label={label(labels, 'chooseMonth')}
      placeholder={placeholder ?? label(labels, 'pickMonth')}
      labels={labels}
      panelClassName="flex w-64 flex-col gap-3 p-3"
      onClear={() => onChange('')}
      {...props}
    >
      <MonthPanel
        locale={locale}
        labels={labels}
        value={value}
        min={min}
        max={max}
        onPick={onChange}
      />
    </Picker>
  )
}

function MonthPanel({
  locale,
  labels,
  value,
  min,
  max,
  onPick,
}: {
  value: string
  min?: string
  max?: string
  onPick: (value: string) => void
  locale?: string
  labels?: Partial<PickerLabels>
}) {
  const close = usePickerClose()
  const months = shortMonths(locale)
  const done = (v: string) => {
    onPick(v)
    close()
  }
  const [now] = useState(() => new Date())
  const thisMonth = key(now.getFullYear(), now.getMonth())
  const [y, m] = value.split('-').map(Number)
  const [year, setYear] = useState(y || now.getFullYear())
  const [focused, setFocused] = useState(m ? m - 1 : now.getMonth())
  const grid = useRef<HTMLDivElement>(null)

  useEffect(() => {
    grid.current?.querySelector<HTMLButtonElement>(`[data-month="${focused}"]`)?.focus()
  }, [focused, year])

  const allowed = (k: string) => (!min || k >= min) && (!max || k <= max)
  const pick = (k: string) => allowed(k) && done(k)

  return (
    <>
      <div className="flex h-8 items-center justify-between">
        <NavButton
          direction={-1}
          label={label(labels, 'previousYear')}
          onClick={() => setYear(year - 1)}
        />
        <span className="text-sm font-semibold tabular-nums">{year}</span>
        <NavButton
          direction={1}
          label={label(labels, 'nextYear')}
          onClick={() => setYear(year + 1)}
        />
      </div>
      <div ref={grid} role="grid" aria-label={String(year)} className="grid grid-cols-3 gap-1">
        {months.map((name, i) => {
          const k = key(year, i)
          const on = k === value
          return (
            <button
              key={name}
              type="button"
              data-month={i}
              tabIndex={i === focused ? 0 : -1}
              disabled={!allowed(k)}
              aria-pressed={on}
              aria-label={fullMonth(year, i, locale)}
              onClick={() => pick(k)}
              onKeyDown={(e) => {
                const moves: Record<string, number> = {
                  ArrowLeft: -1,
                  ArrowRight: 1,
                  ArrowUp: -3,
                  ArrowDown: 3,
                }
                if (!(e.key in moves)) return
                e.preventDefault()
                const next = i + moves[e.key]
                if (next < 0) setYear(year - 1)
                if (next > 11) setYear(year + 1)
                setFocused((next + 12) % 12)
              }}
              className={cn(
                'h-9 rounded-full text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-30',
                on
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted hover:ring-1 hover:ring-border',
                k === thisMonth && 'font-bold',
              )}
            >
              {name}
            </button>
          )
        })}
      </div>
      <PickerFooter>
        <FooterButton onClick={() => pick(thisMonth)} disabled={!allowed(thisMonth)}>
          {label(labels, 'thisMonth')}
        </FooterButton>
        <FooterButton onClick={() => done('')} disabled={!value}>
          {label(labels, 'clear')}
        </FooterButton>
      </PickerFooter>
    </>
  )
}
