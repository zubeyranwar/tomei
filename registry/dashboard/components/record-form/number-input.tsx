'use client'

import { useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { Input } from '@/registry/dashboard/components/input/input'

import { parseDuration, showDuration } from './schema'

const significant = /[\d.-]/

function clean(raw: string, decimals?: number) {
  let out = raw.replace(/[^\d.-]/g, '')
  const negative = out.startsWith('-')
  out = out.replace(/-/g, '')
  const [int, ...rest] = out.split('.')
  let frac = rest.join('')
  if (decimals !== undefined) frac = frac.slice(0, decimals)
  const dot = out.includes('.') && decimals !== 0
  return `${negative ? '-' : ''}${int.replace(/^0+(?=\d)/, '')}${dot ? `.${frac}` : ''}`
}

function display(value: string) {
  if (!value) return ''
  const negative = value.startsWith('-')
  const [int, frac] = value.replace('-', '').split('.')
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${negative ? '-' : ''}${grouped}${frac !== undefined ? `.${frac}` : ''}`
}

export function NumberField({
  id,
  value,
  decimals,
  leading,
  trailing,
  placeholder,
  disabled,
  invalid,
  describedBy,
  onChange,
}: {
  id: string
  value: string
  decimals?: number
  leading?: React.ReactNode
  trailing?: React.ReactNode
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  onChange: (value: string) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [caret, setCaret] = useState<number | null>(null)
  const shown = display(value)

  useLayoutEffect(() => {
    const el = input.current
    if (caret === null || !el || document.activeElement !== el) return
    let seen = 0
    let pos = 0
    while (pos < shown.length && seen < caret) {
      if (significant.test(shown[pos])) seen++
      pos++
    }
    el.setSelectionRange(pos, pos)
  }, [caret, shown])

  return (
    <Input
      ref={input}
      id={id}
      inputMode="decimal"
      value={shown}
      readOnly={disabled}
      placeholder={placeholder}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      leading={leading}
      trailing={trailing}
      onChange={(e) => {
        const before = e.target.value.slice(0, e.target.selectionStart ?? e.target.value.length)
        setCaret([...before].filter((c) => significant.test(c)).length)
        onChange(clean(e.target.value, decimals))
      }}
      onBlur={() => {
        if (decimals === undefined || !value || value === '-') return
        const n = Number(value)
        if (!Number.isNaN(n)) onChange(n.toFixed(decimals))
      }}
      className={cn('tabular-nums', disabled && 'bg-muted/40')}
    />
  )
}

export function DurationField({
  id,
  value,
  placeholder = 'e.g. 1h 30m',
  disabled,
  invalid,
  describedBy,
  onChange,
}: {
  id: string
  value: string
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  onChange: (value: string) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const minutes = value === '' ? null : Number(value)
  const pretty = minutes !== null && !Number.isNaN(minutes) ? showDuration(minutes) : value
  const preview = draft !== null ? parseDuration(draft) : null

  const commit = () => {
    if (draft === null) return
    const parsed = parseDuration(draft)
    onChange(parsed === null ? draft.trim() : String(parsed))
    setDraft(null)
  }

  return (
    <Input
      id={id}
      value={draft ?? pretty}
      readOnly={disabled}
      placeholder={placeholder}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onFocus={() => setDraft(pretty)}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && commit()}
      trailing={
        draft !== null && draft.trim() ? (
          <span className={cn('text-xs', preview === null && 'text-destructive')}>
            {preview === null ? 'Not a duration' : `= ${showDuration(preview)}`}
          </span>
        ) : undefined
      }
      className={cn(disabled && 'bg-muted/40')}
    />
  )
}
