import { cn } from '@/lib/utils'

import { addDays, sameDay } from './dates'

const formats = new Map<
  string,
  { weekdays: string[]; month: Intl.DateTimeFormat; label: Intl.DateTimeFormat }
>()
function formatsFor(locale = 'en-US') {
  let f = formats.get(locale)
  if (!f) {
    const day = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    f = {
      weekdays: Array.from({ length: 7 }, (_, i) =>
        day.format(new Date(2024, 0, 7 + i)).slice(0, 2),
      ),
      month: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      label: new Intl.DateTimeFormat(locale, { dateStyle: 'full' }),
    }
    formats.set(locale, f)
  }
  return f
}

type CalendarMonthProps = {
  month: Date
  start: Date | null
  end: Date | null
  preview: Date | null
  focused: Date
  today: Date
  minDate?: Date
  maxDate?: Date
  onSelect: (date: Date) => void
  onHover: (date: Date | null) => void
  onKeyDown: (event: React.KeyboardEvent, date: Date) => void
  header?: React.ReactNode
  locale?: string
}

export function CalendarMonth({
  month,
  start,
  end,
  preview,
  focused,
  today,
  minDate,
  maxDate,
  onSelect,
  onHover,
  onKeyDown,
  header,
  locale,
}: CalendarMonthProps) {
  const { weekdays, month: monthFormat, label: labelFormat } = formatsFor(locale)
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const length = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const days = Array.from({ length }, (_, i) => addDays(first, i))
  const rangeEnd = end ?? preview
  const [from, to] =
    start && rangeEnd ? (start <= rangeEnd ? [start, rangeEnd] : [rangeEnd, start]) : [start, start]

  return (
    <div className="flex w-[15.75rem] flex-col gap-3">
      <div className="flex h-8 items-center justify-between">{header}</div>
      <p className="sr-only">{monthFormat.format(month)}</p>
      <div role="grid" className="grid grid-cols-7 gap-y-1" onMouseLeave={() => onHover(null)}>
        {weekdays.map((d) => (
          <span key={d} className="py-1 text-center text-xs text-muted-foreground">
            {d}
          </span>
        ))}
        {Array.from({ length: first.getDay() }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const disabled = (!!maxDate && day > maxDate) || (!!minDate && day < minDate)
          const isStart = sameDay(day, from)
          const isEnd = sameDay(day, to)
          const inRange = !!from && !!to && day >= from && day <= to && !sameDay(from, to)

          return (
            <div
              key={day.getDate()}
              className={cn(
                inRange && 'bg-muted',
                inRange && isStart && 'rounded-l-full',
                inRange && isEnd && 'rounded-r-full',
              )}
            >
              <button
                type="button"
                data-date={day.getTime()}
                tabIndex={sameDay(day, focused) ? 0 : -1}
                disabled={disabled}
                aria-label={labelFormat.format(day)}
                aria-pressed={isStart || isEnd}
                onClick={() => onSelect(day)}
                onMouseEnter={() => onHover(day)}
                onKeyDown={(event) => onKeyDown(event, day)}
                className={cn(
                  'mx-auto flex size-9 items-center justify-center rounded-full text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:cursor-not-allowed disabled:opacity-30',
                  isStart || isEnd
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted hover:ring-1 hover:ring-border',
                  sameDay(day, today) && 'font-bold',
                )}
              >
                {day.getDate()}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const monthTitle = (month: Date, locale?: string) => formatsFor(locale).month.format(month)
