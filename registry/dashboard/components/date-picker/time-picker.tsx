'use client'

import { useEffect, useRef, useState } from 'react'
import { Clock } from 'lucide-react'

import { cn } from '@/lib/utils'

import {
  FooterButton,
  Picker,
  PickerFooter,
  PickerInput,
  type PickerBaseProps,
  usePickerClose,
} from './picker'
import { formatClock, label, parseClock, type PickerLabels } from './locale'

type TimePickerProps = PickerBaseProps & {
  value: string
  onChange: (value: string) => void
  step?: number
  min?: string
  max?: string
}

const pad = (n: number) => String(n).padStart(2, '0')
const minutesOf = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
const fromMinutes = (n: number) => `${pad(Math.floor(n / 60))}:${pad(n % 60)}`

export function formatTime(hhmm: string, locale?: string) {
  return formatClock(hhmm, locale)
}

export function parseTime(text: string, locale?: string) {
  const viaDayjs = parseClock(text, locale)
  if (viaDayjs) return viaDayjs
  const t = text.trim().toLowerCase().replace(/\s+/g, '').replace(/\./g, '')
  if (!t) return null
  const match =
    /^(\d{1,2})(?::(\d{2}))?(a|p|am|pm)?$/.exec(t) ?? /^(\d{1,2})(\d{2})(a|p|am|pm)?$/.exec(t)
  if (!match) return null
  let h = Number(match[1])
  const m = Number(match[2] ?? 0)
  const meridiem = match[3]?.[0]
  if (meridiem) {
    if (h < 1 || h > 12) return null
    h = (h % 12) + (meridiem === 'p' ? 12 : 0)
  }
  if (h > 23 || m > 59) return null
  return `${pad(h)}:${pad(m)}`
}

export function TimePicker({
  value,
  onChange,
  step = 15,
  min,
  max,
  placeholder,
  locale,
  labels,
  ...props
}: TimePickerProps) {
  return (
    <Picker
      icon={<Clock />}
      text={value ? formatTime(value, locale) : ''}
      label={label(labels, 'chooseTime')}
      placeholder={placeholder ?? label(labels, 'pickTime')}
      labels={labels}
      panelClassName="flex w-56 flex-col gap-2 p-2"
      onClear={() => onChange('')}
      {...props}
    >
      <TimePanel
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

function TimePanel({
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
  const done = (v: string) => {
    onPick(v)
    close()
  }
  const [typed, setTyped] = useState('')
  const [typedError, setTypedError] = useState(false)
  const [now] = useState(() => {
    const d = new Date()
    const n = Math.round((d.getHours() * 60 + d.getMinutes()) / step) * step
    return fromMinutes(Math.min(n, 1440 - step))
  })
  const list = useRef<HTMLUListElement>(null)
  const input = useRef<HTMLInputElement>(null)

  const allowed = (t: string) => (!min || t >= min) && (!max || t <= max)
  const slots = Array.from({ length: Math.ceil(1440 / step) }, (_, i) =>
    fromMinutes(i * step),
  ).filter(allowed)

  const q = typed.trim().toLowerCase().replace(/\s/g, '')
  const exact = parseTime(typed, locale)
  const shown = q
    ? slots.filter(
        (s) =>
          formatTime(s, locale).toLowerCase().replace(/\s/g, '').startsWith(q) || s.startsWith(q),
      )
    : slots

  const [anchor] = useState(() => {
    const target = minutesOf(value || now)
    return slots.reduce(
      (best, s) =>
        Math.abs(minutesOf(s) - target) < Math.abs(minutesOf(best) - target) ? s : best,
      slots[0],
    )
  })

  useEffect(() => {
    list.current
      ?.querySelector<HTMLElement>(`[data-time="${anchor}"]`)
      ?.scrollIntoView({ block: 'center' })
  }, [anchor])

  const pick = (t: string) => (allowed(t) ? done(t) : setTypedError(true))

  const focusSlot = (index: number) => {
    const buttons = list.current?.querySelectorAll<HTMLButtonElement>('button')
    if (!buttons?.length) return
    buttons[Math.max(0, Math.min(buttons.length - 1, index))].focus()
  }

  return (
    <>
      <PickerInput
        inputRef={input}
        autoFocus
        value={typed}
        placeholder={label(labels, 'typeTime', { example: formatTime('14:30', locale) })}
        label={label(labels, 'chooseTime')}
        invalid={typedError}
        onChange={(v) => {
          setTyped(v)
          setTypedError(false)
        }}
        onCommit={() => {
          const t = exact ?? shown[0]
          if (t) pick(t)
          else setTypedError(true)
        }}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowDown') return
          e.preventDefault()
          const index = shown.indexOf(value || anchor)
          focusSlot(index >= 0 ? index : 0)
        }}
      />
      {exact && !shown.includes(exact) && allowed(exact) && (
        <button
          type="button"
          onClick={() => pick(exact)}
          className="flex h-8 items-center rounded-lg px-2.5 text-left text-sm hover:bg-muted"
        >
          {label(labels, 'use', { time: formatTime(exact, locale) })}
        </button>
      )}
      <ul
        ref={list}
        role="listbox"
        aria-label="Times"
        className="flex max-h-56 [scrollbar-width:thin] [scrollbar-gutter:stable] flex-col gap-px overflow-y-auto py-0.5 pr-1.5"
        onKeyDown={(e) => {
          const moves: Record<string, number> = {
            ArrowDown: 1,
            ArrowUp: -1,
            PageDown: 8,
            PageUp: -8,
          }
          if (!(e.key in moves)) return
          e.preventDefault()
          const buttons = [...(list.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
          const index = buttons.indexOf(e.target as HTMLButtonElement)
          if (index <= 0 && moves[e.key] < 0) return input.current?.focus()
          focusSlot(index + moves[e.key])
        }}
      >
        {shown.map((t) => (
          <li key={t}>
            <button
              type="button"
              role="option"
              data-time={t}
              aria-selected={t === value}
              onClick={() => pick(t)}
              className={cn(
                'flex h-8 w-full items-center justify-between rounded-lg px-2.5 text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                t === value ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
              )}
            >
              {formatTime(t, locale)}
              {t === now && t !== value && (
                <span className="text-xs text-muted-foreground">Now</span>
              )}
            </button>
          </li>
        ))}
        {!shown.length && !exact && (
          <li className="px-2.5 py-2 text-sm text-muted-foreground">{label(labels, 'noTimes')}</li>
        )}
      </ul>
      <PickerFooter>
        <FooterButton onClick={() => pick(now)} disabled={!allowed(now)}>
          {label(labels, 'now')}
        </FooterButton>
        <FooterButton onClick={() => done('')} disabled={!value}>
          {label(labels, 'clear')}
        </FooterButton>
      </PickerFooter>
    </>
  )
}
