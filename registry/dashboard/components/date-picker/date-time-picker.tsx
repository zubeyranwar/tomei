'use client'

import { useEffect, useRef, useState } from 'react'
import { CalendarClock } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  CalendarMonth,
  monthTitle,
} from '@/registry/dashboard/components/date-range-picker/calendar-month'
import {
  addDays,
  fromInputValue,
  sameMonth,
  startOfDay,
  startOfMonth,
  toInputValue,
} from '@/registry/dashboard/components/date-range-picker/dates'

import {
  FooterButton,
  NavButton,
  Picker,
  PickerFooter,
  usePickerClose,
  type PickerBaseProps,
} from './picker'
import { formatDay, label, type PickerLabels } from './locale'
import { formatTime } from './time-picker'

type DateTimePickerProps = PickerBaseProps & {
  value: string
  onChange: (value: string) => void
  step?: number
  min?: string
  max?: string
}

const pad = (n: number) => String(n).padStart(2, '0')
const keyOffsets: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
}

export function formatDateTime(value: string, locale?: string) {
  const [date, time] = value.split('T')
  const d = fromInputValue(date ?? '')
  if (!d) return value
  return time ? `${formatDay(d, locale)}, ${formatTime(time, locale)}` : formatDay(d, locale)
}

export function DateTimePicker({
  value,
  onChange,
  step = 15,
  min,
  max,
  placeholder,
  locale,
  labels,
  ...props
}: DateTimePickerProps) {
  return (
    <Picker
      icon={<CalendarClock />}
      text={value ? formatDateTime(value, locale) : ''}
      label={label(labels, 'chooseDateTime')}
      placeholder={placeholder ?? label(labels, 'pickDateTime')}
      labels={labels}
      panelClassName="flex flex-col gap-3 p-3"
      onClear={() => onChange('')}
      {...props}
    >
      <DateTimePanel
        locale={locale}
        labels={labels}
        value={value}
        step={step}
        min={min}
        max={max}
        onPick={onChange}
      />
    </Picker>
  )
}

function DateTimePanel({
  locale,
  labels,
  value,
  step,
  min,
  max,
  onPick,
}: {
  value: string
  step: number
  min?: string
  max?: string
  onPick: (value: string) => void
  locale?: string
  labels?: Partial<PickerLabels>
}) {
  const close = usePickerClose()
  const [today] = useState(() => startOfDay(new Date()))
  const [initialDate, initialTime = ''] = value.split('T')
  const minDay = min ? fromInputValue(min.slice(0, 10)) : null
  const maxDay = max ? fromInputValue(max.slice(0, 10)) : null
  const dayAllowed = (d: Date) => (!minDay || d >= minDay) && (!maxDay || d <= maxDay)

  const startDay =
    fromInputValue(initialDate ?? '') ?? (dayAllowed(today) ? today : (minDay ?? today))
  const [day, setDay] = useState<Date | null>(fromInputValue(initialDate ?? ''))
  const [time, setTime] = useState(initialTime)
  const [view, setView] = useState(() => startOfMonth(startDay))
  const [focused, setFocused] = useState(startDay)
  const [focusTick, setFocusTick] = useState(1)
  const grid = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLUListElement>(null)

  const slots = Array.from({ length: Math.ceil(1440 / step) }, (_, i) => {
    const m = i * step
    return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
  })
  const stamp = (d: Date, t: string) => `${toInputValue(d)}T${t}`
  const allowed = (d: Date, t: string) =>
    (!min || stamp(d, t) >= min) && (!max || stamp(d, t) <= max)

  useEffect(() => {
    if (!focusTick) return
    grid.current?.querySelector<HTMLButtonElement>(`[data-date="${focused.getTime()}"]`)?.focus()
  }, [focusTick, focused, view])

  useEffect(() => {
    const target = initialTime || slots[Math.floor((9 * 60) / step)]
    list.current
      ?.querySelector<HTMLElement>(`[data-time="${target}"]`)
      ?.scrollIntoView({ block: 'center' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const finish = (d: Date, t: string) => {
    onPick(stamp(d, t))
    close()
  }

  return (
    <>
      <div className="flex gap-3">
        <div ref={grid}>
          <CalendarMonth
            month={view}
            start={day}
            end={day}
            preview={null}
            focused={focused}
            today={today}
            minDate={minDay ?? undefined}
            maxDate={maxDay ?? undefined}
            onSelect={(d) => {
              setDay(d)
              setFocused(d)
              setFocusTick(0)
              if (time && allowed(d, time)) finish(d, time)
            }}
            onHover={() => {}}
            locale={locale}
            onKeyDown={(event, date) => {
              const offset = keyOffsets[event.key]
              if (offset === undefined) return
              event.preventDefault()
              const next = addDays(date, offset)
              setFocused(next)
              setFocusTick(focusTick + 1)
              if (!sameMonth(next, view)) setView(startOfMonth(next))
            }}
            header={
              <>
                <NavButton
                  direction={-1}
                  label={label(labels, 'previousMonth')}
                  onClick={() => setView(startOfMonth(view, -1))}
                />
                <span className="flex-1 text-center text-sm font-semibold">
                  {monthTitle(view, locale)}
                </span>
                <NavButton
                  direction={1}
                  label={label(labels, 'nextMonth')}
                  onClick={() => setView(startOfMonth(view, 1))}
                />
              </>
            }
          />
        </div>
        <div className="flex w-32 flex-col gap-2 border-l pl-3">
          <span className="flex h-8 items-center text-sm font-semibold">
            {label(labels, 'time')}
          </span>
          <ul
            ref={list}
            role="listbox"
            aria-label="Times"
            className="-mr-1 flex max-h-[17rem] [scrollbar-width:thin] [scrollbar-gutter:stable] flex-col gap-px overflow-y-auto py-0.5 pr-1.5"
          >
            {slots.map((t) => {
              const ok = !day || allowed(day, t)
              return (
                <li key={t}>
                  <button
                    type="button"
                    role="option"
                    data-time={t}
                    aria-selected={t === time}
                    disabled={!ok}
                    onClick={() => {
                      setTime(t)
                      if (day) finish(day, t)
                    }}
                    className={cn(
                      'flex h-8 w-full items-center rounded-lg px-2 text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-30',
                      t === time ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                    )}
                  >
                    {formatTime(t, locale)}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      <PickerFooter>
        <span className="text-xs text-muted-foreground">
          {day && time
            ? formatDateTime(stamp(day, time), locale)
            : day
              ? label(labels, 'pickTimeNext')
              : time
                ? label(labels, 'pickDayNext')
                : label(labels, 'pickDayTime')}
        </span>
        <div className="flex gap-1">
          <FooterButton
            onClick={() => {
              const now = new Date()
              const n = Math.ceil((now.getHours() * 60 + now.getMinutes()) / step) * step
              const t = `${pad(Math.floor(Math.min(n, 1439) / 60))}:${pad(Math.min(n, 1439) % 60)}`
              finish(startOfDay(now), t)
            }}
          >
            {label(labels, 'now')}
          </FooterButton>
          <FooterButton
            onClick={() => {
              onPick('')
              close()
            }}
            disabled={!value}
          >
            {label(labels, 'clear')}
          </FooterButton>
        </div>
      </PickerFooter>
    </>
  )
}
