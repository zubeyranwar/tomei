'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { CalendarMonth, monthTitle } from './calendar-month'
import {
  addDays,
  defaultPresets,
  formatRange,
  fromInputValue,
  sameMonth,
  sameRange,
  startOfDay,
  startOfMonth,
  toInputValue,
  type DatePreset,
  type DateRange,
} from './dates'

export type { DatePreset, DateRange }
export { defaultPresets }

type DateRangePickerProps = {
  value?: DateRange
  defaultValue?: DateRange
  onChange?: (range: DateRange, preset?: string) => void
  presets?: DatePreset[]
  maxDate?: Date
  disableFuture?: boolean
  align?: 'start' | 'end'
  className?: string
}

const keyOffsets: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
}

export function DateRangePicker({
  value,
  defaultValue,
  onChange,
  presets = defaultPresets,
  maxDate: maxDateProp,
  disableFuture = false,
  align = 'start',
  className,
}: DateRangePickerProps) {
  const [today] = useState(() => startOfDay(new Date()))
  const maxDate = disableFuture ? today : maxDateProp
  const [internal, setInternal] = useState<DateRange>(
    () => defaultValue ?? presets[3]?.range(today) ?? { start: today, end: today },
  )
  const committed = value ?? internal

  const [open, setOpen] = useState(false)
  const [start, setStart] = useState<Date | null>(committed.start)
  const [end, setEnd] = useState<Date | null>(committed.end)
  const [preview, setPreview] = useState<Date | null>(null)
  const [view, setView] = useState(() => startOfMonth(committed.end, -1))
  const [focused, setFocused] = useState(committed.end)
  const [inputs, setInputs] = useState({ start: '', end: '' })

  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const keyboard = useRef(false)

  const presetFor = (range: DateRange) => presets.find((p) => sameRange(p.range(today), range))
  const draft = start && end ? { start, end } : null
  const activePreset = draft ? presetFor(draft)?.label : undefined
  const committedPreset = presetFor(committed)?.label

  const show = (range: { start: Date | null; end: Date | null }) => {
    setStart(range.start)
    setEnd(range.end)
    setInputs({
      start: range.start ? toInputValue(range.start) : '',
      end: range.end ? toInputValue(range.end) : '',
    })
  }

  const reveal = (date: Date) => {
    if (!sameMonth(date, view) && !sameMonth(date, startOfMonth(view, 1)))
      setView(startOfMonth(date, -1))
  }

  const openPicker = () => {
    show(committed)
    setView(startOfMonth(committed.end, -1))
    setFocused(committed.end)
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    setPreview(null)
    trigger.current?.focus()
  }

  const apply = () => {
    if (!start) return
    const range = { start, end: end ?? start }
    if (value === undefined) setInternal(range)
    onChange?.(range, presetFor(range)?.label)
    close()
  }

  const select = (date: Date) => {
    setFocused(date)
    if (!start || end) return show({ start: date, end: null })
    show(date < start ? { start: date, end: start } : { start, end: date })
  }

  const choosePreset = (preset: DatePreset) => {
    const range = preset.range(today)
    show(range)
    setView(startOfMonth(range.end, -1))
    setFocused(range.end)
  }

  const commitInput = (key: 'start' | 'end') => {
    const date = fromInputValue(inputs[key])
    if (!date || (maxDate && date > maxDate)) return show({ start, end })
    const next =
      key === 'start' ? { start: date, end: end ?? date } : { start: start ?? date, end: date }
    show(next.start <= next.end ? next : { start: next.end, end: next.start })
    reveal(date)
    setFocused(date)
  }

  const onDayKeyDown = (event: React.KeyboardEvent, date: Date) => {
    const offset = keyOffsets[event.key]
    if (offset === undefined) return
    event.preventDefault()
    const next = addDays(date, offset)
    keyboard.current = true
    setFocused(next)
    reveal(next)
    if (start && !end) setPreview(next)
  }

  useEffect(() => {
    if (!keyboard.current) return
    keyboard.current = false
    grid.current?.querySelector<HTMLButtonElement>(`[data-date="${focused.getTime()}"]`)?.focus()
  }, [focused, view])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close()
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  })

  const month = (offset: number, header: React.ReactNode) => (
    <CalendarMonth
      month={startOfMonth(view, offset)}
      start={start}
      end={end}
      preview={start && !end ? preview : null}
      focused={focused}
      today={today}
      maxDate={maxDate}
      onSelect={select}
      onHover={setPreview}
      onKeyDown={onDayKeyDown}
      header={header}
    />
  )

  const nav = (direction: -1 | 1, label: string) => (
    <button
      type="button"
      aria-label={label}
      onClick={() => setView(startOfMonth(view, direction))}
      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
        <path
          d={direction < 0 ? 'M10 3 5 8l5 5' : 'm6 3 5 5-5 5'}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )

  const title = (offset: number) => (
    <span className="flex-1 text-center text-sm font-semibold">
      {monthTitle(startOfMonth(view, offset))}
    </span>
  )

  return (
    <div ref={root} className={cn('relative inline-flex', className)}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? close() : openPicker())}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-card px-3 text-sm font-medium text-foreground shadow-(--shadow-button) transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <svg viewBox="0 0 16 16" fill="none" className="size-3.5" aria-hidden>
          <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        {committedPreset ?? formatRange(committed)}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a date range"
          className={cn(
            'absolute top-full z-50 mt-2 flex max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-(--shadow-overlay)',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          <ul className="hidden w-44 shrink-0 flex-col gap-px overflow-y-auto border-r p-2 md:flex">
            {presets.map((preset) => (
              <li key={preset.label}>
                <button
                  type="button"
                  onClick={() => choosePreset(preset)}
                  aria-pressed={activePreset === preset.label}
                  className={cn(
                    'flex h-8 w-full items-center rounded-lg px-2.5 text-left text-sm hover:bg-muted',
                    activePreset === preset.label && 'bg-muted font-medium',
                  )}
                >
                  {preset.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-4 p-4">
            <select
              aria-label="Date range"
              value={activePreset ?? ''}
              onChange={(e) => {
                const preset = presets.find((p) => p.label === e.target.value)
                if (preset) choosePreset(preset)
              }}
              className="h-8 rounded-lg border border-input bg-card px-2 text-sm md:hidden"
            >
              <option value="" disabled>
                Custom
              </option>
              {presets.map((p) => (
                <option key={p.label}>{p.label}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              {(['start', 'end'] as const).map((key, i) => (
                <div key={key} className="contents">
                  {i === 1 && <span className="text-muted-foreground">→</span>}
                  <input
                    aria-label={key === 'start' ? 'Start date' : 'End date'}
                    placeholder="YYYY-MM-DD"
                    value={inputs[key]}
                    onChange={(e) => setInputs({ ...inputs, [key]: e.target.value })}
                    onBlur={() => commitInput(key)}
                    onKeyDown={(e) => e.key === 'Enter' && commitInput(key)}
                    className="h-8 w-full min-w-0 rounded-lg border border-input bg-card px-2.5 text-sm tabular-nums outline-none focus:border-ring"
                  />
                </div>
              ))}
            </div>

            <div ref={grid} className="flex gap-6">
              {month(
                0,
                <>
                  {nav(-1, 'Previous month')}
                  {title(0)}
                  <span className="size-8 max-md:hidden" />
                  <span className="md:hidden">{nav(1, 'Next month')}</span>
                </>,
              )}
              <div className="max-md:hidden">
                {month(
                  1,
                  <>
                    <span className="size-8" />
                    {title(1)}
                    {nav(1, 'Next month')}
                  </>,
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t pt-4">
              <span className="text-xs text-muted-foreground">
                {draft ? formatRange(draft) : 'Select an end date'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="h-8 rounded-lg bg-card px-3 text-sm font-medium shadow-(--shadow-button) hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={apply}
                  disabled={!draft}
                  className="h-8 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
