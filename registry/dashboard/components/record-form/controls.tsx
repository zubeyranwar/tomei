'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'
import {
  CalendarMonth,
  monthTitle,
} from '@/registry/dashboard/components/date-range-picker/calendar-month'
import {
  addDays,
  fromInputValue,
  startOfDay,
  startOfMonth,
  toInputValue,
} from '@/registry/dashboard/components/date-range-picker/dates'

import { Popover } from './popover'

const trigger =
  'border-input bg-card text-foreground hover:border-ring flex min-h-8 w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1 text-left text-sm outline-none focus-visible:border-ring'

const chevron = (
  <span aria-hidden className="text-[10px] text-muted-foreground">
    ▾
  </span>
)

function OptionSearch({
  value,
  onChange,
  onEnter,
}: {
  value: string
  onChange: (value: string) => void
  onEnter?: () => void
}) {
  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          onEnter?.()
        }
      }}
      placeholder="Search"
      aria-label="Search options"
      className="mb-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
    />
  )
}

export function SelectField({
  id,
  value,
  options,
  placeholder = 'Select',
  onChange,
}: {
  id: string
  value: string
  options: string[]
  placeholder?: string
  onChange: (value: string) => void
}) {
  const [query, setQuery] = useState('')
  const shown = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))

  return (
    <Popover
      className="w-full"
      trigger={({ open, toggle }) => (
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={toggle}
          className={trigger}
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value || placeholder}
          </span>
          {chevron}
        </button>
      )}
    >
      {(close) => (
        <>
          {options.length > 7 && <OptionSearch value={query} onChange={setQuery} />}
          <ul role="listbox" className="max-h-60 overflow-y-auto">
            {shown.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option === value}
                  onClick={() => {
                    onChange(option === value ? '' : option)
                    setQuery('')
                    close()
                  }}
                  className="flex h-8 w-full items-center justify-between rounded-lg px-2 text-sm hover:bg-muted"
                >
                  {option}
                  {option === value && <span aria-hidden>✓</span>}
                </button>
              </li>
            ))}
            {!shown.length && (
              <li className="px-2 py-1.5 text-sm text-muted-foreground">No matches</li>
            )}
          </ul>
        </>
      )}
    </Popover>
  )
}

export function MultiSelectField({
  id,
  value,
  options,
  creatable = false,
  placeholder = 'Add',
  onChange,
}: {
  id: string
  value: string[]
  options: string[]
  creatable?: boolean
  placeholder?: string
  onChange: (value: string[]) => void
}) {
  const [query, setQuery] = useState('')
  const all = [...new Set([...options, ...value])]
  const shown = all.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
  const toggle = (option: string) =>
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option])

  const create = () => {
    const text = query.trim()
    if (!creatable || !text || all.includes(text)) return
    onChange([...value, text])
    setQuery('')
  }

  return (
    <Popover
      className="w-full"
      trigger={({ open, toggle: toggleOpen }) => (
        <div
          id={id}
          role="button"
          tabIndex={0}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={toggleOpen}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleOpen()}
          className={cn(trigger, 'flex-wrap justify-start')}
        >
          {value.map((v) => (
            <span
              key={v}
              className="flex items-center gap-1 rounded-md bg-muted py-0.5 pr-1 pl-2 text-xs"
            >
              {v}
              <button
                type="button"
                aria-label={`Remove ${v}`}
                onClick={(e) => {
                  e.stopPropagation()
                  toggle(v)
                }}
                className="px-0.5 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </span>
          ))}
          {!value.length && <span className="text-muted-foreground">{placeholder}</span>}
          <span className="ml-auto">{chevron}</span>
        </div>
      )}
    >
      <OptionSearch value={query} onChange={setQuery} onEnter={create} />
      <ul role="listbox" aria-multiselectable className="max-h-60 overflow-y-auto">
        {shown.map((option) => (
          <li key={option}>
            <button
              type="button"
              role="option"
              aria-selected={value.includes(option)}
              onClick={() => toggle(option)}
              className="flex h-8 w-full items-center justify-between rounded-lg px-2 text-sm hover:bg-muted"
            >
              {option}
              {value.includes(option) && <span aria-hidden>✓</span>}
            </button>
          </li>
        ))}
        {creatable && query.trim() && !all.includes(query.trim()) && (
          <li>
            <button
              type="button"
              onClick={create}
              className="flex h-8 w-full items-center rounded-lg px-2 text-sm hover:bg-muted"
            >
              Create “{query.trim()}”
            </button>
          </li>
        )}
      </ul>
    </Popover>
  )
}

export function ToggleField({
  id,
  value,
  label,
  onChange,
}: {
  id: string
  value: boolean
  label?: string
  onChange: (value: boolean) => void
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex items-center gap-2.5 text-sm"
    >
      <span
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors',
          value ? 'bg-primary' : 'bg-input',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-4 rounded-full bg-card shadow transition-transform',
            value && 'translate-x-4',
          )}
        />
      </span>
      {label}
    </button>
  )
}

export function RadioField({
  id,
  value,
  options,
  onChange,
}: {
  id: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div id={id} role="radiogroup" className="flex rounded-lg bg-muted p-0.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          onClick={() => onChange(option)}
          className={cn(
            'h-7 flex-1 rounded-md text-sm transition-colors',
            value === option
              ? 'bg-card font-medium text-foreground shadow-(--shadow-button)'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

export function DateField({
  id,
  value,
  placeholder = 'Pick a date',
  onChange,
}: {
  id: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}) {
  const selected = fromInputValue(value)
  const [today] = useState(() => startOfDay(new Date()))
  const [view, setView] = useState(() => startOfMonth(selected ?? today))
  const [focused, setFocused] = useState(selected ?? today)

  const nav = (direction: -1 | 1) => (
    <button
      type="button"
      aria-label={direction < 0 ? 'Previous month' : 'Next month'}
      onClick={() => setView(startOfMonth(view, direction))}
      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
    >
      {direction < 0 ? '‹' : '›'}
    </button>
  )

  return (
    <Popover
      className="w-auto"
      trigger={({ open, toggle }) => (
        <button
          id={id}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={toggle}
          className={trigger}
        >
          <span className={cn(!selected && 'text-muted-foreground')}>
            {selected ? dateFormat.format(selected) : placeholder}
          </span>
          {chevron}
        </button>
      )}
    >
      {(close) => (
        <div className="p-1">
          <CalendarMonth
            month={view}
            start={selected}
            end={selected}
            preview={null}
            focused={focused}
            today={today}
            onSelect={(date) => {
              onChange(toInputValue(date))
              close()
            }}
            onHover={() => {}}
            onKeyDown={(event, date) => {
              const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key]
              if (step === undefined) return
              event.preventDefault()
              const next = addDays(date, step)
              setFocused(next)
              setView(startOfMonth(next))
            }}
            header={
              <>
                {nav(-1)}
                <span className="flex-1 text-center text-sm font-semibold">{monthTitle(view)}</span>
                {nav(1)}
              </>
            }
          />
          {selected && (
            <button
              type="button"
              onClick={() => {
                onChange('')
                close()
              }}
              className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </Popover>
  )
}
