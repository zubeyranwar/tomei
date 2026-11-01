'use client'

import { useEffect, useRef, useState } from 'react'
import { CalendarRange } from 'lucide-react'

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
  type DatePreset,
} from '@/registry/dashboard/components/date-range-picker/dates'

import { parseDate } from './date-picker'
import { formatDay, label, type PickerLabels } from './locale'
import {
  FooterButton,
  NavButton,
  Picker,
  PickerFooter,
  PickerInput,
  usePickerClose,
  type PickerBaseProps,
} from './picker'

type DateRangeFieldProps = PickerBaseProps & {
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  presets?: DatePreset[]
}

const keyOffsets: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
}

const rangeText = (start: Date, end: Date, locale?: string) =>
  `${formatDay(start, locale)} – ${formatDay(end, locale)}`

export const splitRange = (value: string) => {
  const [a = '', b = ''] = value.split('/')
  return [fromInputValue(a), fromInputValue(b)] as const
}

export function DateRangeField({
  value,
  onChange,
  min,
  max,
  presets,
  placeholder,
  locale,
  labels,
  ...props
}: DateRangeFieldProps) {
  const [start, end] = splitRange(value)
  return (
    <Picker
      icon={<CalendarRange />}
      text={start && end ? rangeText(start, end, locale) : ''}
      label={label(labels, 'chooseRange')}
      placeholder={placeholder ?? label(labels, 'pickDates')}
      labels={labels}
      panelClassName="flex"
      onClear={() => onChange('')}
      {...props}
    >
      <RangePanel
        locale={locale}
        labels={labels}
        value={value}
        min={min}
        max={max}
        presets={presets}
        onPick={onChange}
      />
    </Picker>
  )
}

function RangePanel({
  locale,
  labels,
  value,
  min,
  max,
  presets,
  onPick,
}: {
  value: string
  min?: string
  max?: string
  presets?: DatePreset[]
  onPick: (value: string) => void
  locale?: string
  labels?: Partial<PickerLabels>
}) {
  const close = usePickerClose()
  const [today] = useState(() => startOfDay(new Date()))
  const [initialStart, initialEnd] = splitRange(value)
  const minDate = (min && fromInputValue(min)) || undefined
  const maxDate = (max && fromInputValue(max)) || undefined
  const allowed = (d: Date) => (!minDate || d >= minDate) && (!maxDate || d <= maxDate)

  const [start, setStart] = useState<Date | null>(initialStart)
  const [end, setEnd] = useState<Date | null>(initialEnd)
  const [preview, setPreview] = useState<Date | null>(null)
  const anchor = initialStart ?? (allowed(today) ? today : (minDate ?? today))
  const [view, setView] = useState(() => startOfMonth(anchor))
  const [focused, setFocused] = useState(anchor)
  const [focusTick, setFocusTick] = useState(1)
  const [inputs, setInputs] = useState({
    start: initialStart ? toInputValue(initialStart) : '',
    end: initialEnd ? toInputValue(initialEnd) : '',
  })
  const grid = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!focusTick) return
    grid.current?.querySelector<HTMLButtonElement>(`[data-date="${focused.getTime()}"]`)?.focus()
  }, [focusTick, focused, view])

  const commit = (a: Date, b: Date) => {
    onPick(`${toInputValue(a)}/${toInputValue(b)}`)
    close()
  }

  const show = (a: Date | null, b: Date | null) => {
    setStart(a)
    setEnd(b)
    setInputs({ start: a ? toInputValue(a) : '', end: b ? toInputValue(b) : '' })
  }

  const select = (date: Date) => {
    if (!allowed(date)) return
    setFocused(date)
    if (!start || end) return show(date, null)
    const [a, b] = date < start ? [date, start] : [start, date]
    show(a, b)
    commit(a, b)
  }

  const commitInput = (key: 'start' | 'end') => {
    const date = parseDate(inputs[key], locale)
    if (!date || !allowed(date)) return show(start, end)
    const a = key === 'start' ? date : (start ?? date)
    const b = key === 'end' ? date : (end ?? date)
    const [s, e] = a <= b ? [a, b] : [b, a]
    show(s, e)
    if (!sameMonth(date, view)) setView(startOfMonth(date))
  }

  const month = (offset: number, header: React.ReactNode) => (
    <CalendarMonth
      month={startOfMonth(view, offset)}
      start={start}
      end={end}
      preview={start && !end ? preview : null}
      focused={focused}
      today={today}
      minDate={minDate}
      maxDate={maxDate}
      onSelect={select}
      onHover={setPreview}
      locale={locale}
      onKeyDown={(event, date) => {
        const offsetDays = keyOffsets[event.key]
        if (offsetDays === undefined) return
        event.preventDefault()
        const next = addDays(date, offsetDays)
        setFocused(next)
        setFocusTick(focusTick + 1)
        if (start && !end) setPreview(next)
        if (!sameMonth(next, view) && !sameMonth(next, startOfMonth(view, 1)))
          setView(startOfMonth(next, next < view ? 0 : -1))
      }}
      header={header}
    />
  )

  const title = (offset: number) => (
    <span className="flex-1 text-center text-sm font-semibold">
      {monthTitle(startOfMonth(view, offset), locale)}
    </span>
  )

  return (
    <>
      {presets?.length ? (
        <ul className="hidden w-40 shrink-0 flex-col gap-px overflow-y-auto border-r p-2 md:flex">
          {presets.map((preset) => (
            <li key={preset.label}>
              <button
                type="button"
                onClick={() => {
                  const r = preset.range(today)
                  commit(r.start, r.end)
                }}
                className="flex h-8 w-full items-center rounded-lg px-2.5 text-left text-sm hover:bg-muted"
              >
                {preset.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-col gap-3 p-3">
        <div className="flex items-center gap-2">
          <PickerInput
            value={inputs.start}
            placeholder={label(labels, 'start')}
            label={label(labels, 'startDate')}
            onChange={(v) => {
              setInputs({ ...inputs, start: v })
              setFocusTick(0)
            }}
            onCommit={() => commitInput('start')}
          />
          <span className="text-muted-foreground">→</span>
          <PickerInput
            value={inputs.end}
            placeholder={label(labels, 'end')}
            label={label(labels, 'endDate')}
            onChange={(v) => {
              setInputs({ ...inputs, end: v })
              setFocusTick(0)
            }}
            onCommit={() => commitInput('end')}
          />
        </div>
        <div ref={grid} className="flex gap-6">
          {month(
            0,
            <>
              <NavButton
                direction={-1}
                label={label(labels, 'previousMonth')}
                onClick={() => setView(startOfMonth(view, -1))}
              />
              {title(0)}
              <span className="size-8 max-md:hidden" />
              <span className="md:hidden">
                <NavButton
                  direction={1}
                  label={label(labels, 'nextMonth')}
                  onClick={() => setView(startOfMonth(view, 1))}
                />
              </span>
            </>,
          )}
          <div className="max-md:hidden">
            {month(
              1,
              <>
                <span className="size-8" />
                {title(1)}
                <NavButton
                  direction={1}
                  label={label(labels, 'nextMonth')}
                  onClick={() => setView(startOfMonth(view, 1))}
                />
              </>,
            )}
          </div>
        </div>
        <PickerFooter>
          <span
            className={cn('text-xs', start && end ? 'text-foreground' : 'text-muted-foreground')}
          >
            {start && end
              ? rangeText(start, end, locale)
              : start
                ? label(labels, 'pickEnd')
                : label(labels, 'pickStart')}
          </span>
          <div className="flex gap-1">
            {start && end && (
              <FooterButton onClick={() => commit(start, end)}>
                {label(labels, 'apply')}
              </FooterButton>
            )}
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
      </div>
    </>
  )
}
