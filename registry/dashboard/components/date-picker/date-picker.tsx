'use client'

import { useEffect, useRef, useState } from 'react'
import { Calendar } from 'lucide-react'

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
  PickerInput,
  type PickerBaseProps,
  usePickerClose,
} from './picker'
import { formatDay, label, parseDay, type PickerLabels } from './locale'

type DatePickerProps = PickerBaseProps & {
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
}

const keyOffsets: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
}

export function parseDate(text: string, locale?: string) {
  return parseDay(text, locale)
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder,
  locale,
  labels,
  ...props
}: DatePickerProps) {
  const selected = fromInputValue(value)
  return (
    <Picker
      icon={<Calendar />}
      text={selected ? formatDay(selected, locale) : ''}
      label={label(labels, 'chooseDate')}
      placeholder={placeholder ?? label(labels, 'pickDate')}
      labels={labels}
      panelClassName="flex flex-col gap-3 p-3"
      onClear={() => onChange('')}
      {...props}
    >
      <DatePanel
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

function DatePanel({
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
  const done = (v: string) => {
    onPick(v)
    close()
  }
  const [today] = useState(() => startOfDay(new Date()))
  const selected = fromInputValue(value)
  const minDate = (min && fromInputValue(min)) || undefined
  const maxDate = (max && fromInputValue(max)) || undefined
  const allowed = (d: Date) => (!minDate || d >= minDate) && (!maxDate || d <= maxDate)
  const start = selected ?? (allowed(today) ? today : (minDate ?? maxDate ?? today))

  const [view, setView] = useState(() => startOfMonth(start))
  const [focused, setFocused] = useState(start)
  const [focusTick, setFocusTick] = useState(1)
  const [typed, setTyped] = useState(selected ? toInputValue(selected) : '')
  const [typedError, setTypedError] = useState(false)
  const grid = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!focusTick) return
    grid.current?.querySelector<HTMLButtonElement>(`[data-date="${focused.getTime()}"]`)?.focus()
  }, [focusTick, focused, view])

  const pick = (date: Date) => allowed(date) && done(toInputValue(date))

  const commitTyped = () => {
    const date = parseDate(typed, locale)
    if (!date || !allowed(date)) return setTypedError(!!typed.trim())
    pick(date)
  }

  return (
    <>
      <PickerInput
        value={typed}
        placeholder={label(labels, 'typeDate', { example: formatDay(today, locale) })}
        label={label(labels, 'chooseDate')}
        invalid={typedError}
        onChange={(v) => {
          setTyped(v)
          setTypedError(false)
          setFocusTick(0)
          const date = parseDate(v, locale)
          if (date && !sameMonth(date, view)) setView(startOfMonth(date))
        }}
        onCommit={commitTyped}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowDown') return
          e.preventDefault()
          setFocusTick(focusTick + 1)
        }}
      />
      <div ref={grid}>
        <CalendarMonth
          month={view}
          start={selected}
          end={selected}
          preview={null}
          focused={focused}
          today={today}
          minDate={minDate}
          maxDate={maxDate}
          onSelect={pick}
          locale={locale}
          onHover={() => {}}
          onKeyDown={(event, date) => {
            const page = event.key === 'PageUp' ? -1 : event.key === 'PageDown' ? 1 : 0
            const offset = keyOffsets[event.key]
            if (offset === undefined && !page) return
            event.preventDefault()
            const next = page
              ? new Date(date.getFullYear(), date.getMonth() + page, date.getDate())
              : addDays(date, offset)
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
      <PickerFooter>
        <FooterButton onClick={() => pick(today)} disabled={!allowed(today)}>
          {label(labels, 'today')}
        </FooterButton>
        <FooterButton onClick={() => done('')} disabled={!value}>
          {label(labels, 'clear')}
        </FooterButton>
      </PickerFooter>
    </>
  )
}
