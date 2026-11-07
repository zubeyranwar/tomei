'use client'

import { useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { useFormConfig } from './context'
import { Popover } from '@/registry/dashboard/components/popover/popover'
import { normalizeOptions, type Option, type OptionObject } from './schema'

export const triggerClass =
  'border-input bg-card text-foreground hover:border-ring flex min-h-8 w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1 text-left text-sm outline-none focus-visible:border-ring disabled:cursor-default disabled:bg-muted/40 disabled:hover:border-input aria-disabled:cursor-default aria-disabled:bg-muted/40 aria-disabled:hover:border-input'

const chevron = (
  <span aria-hidden className="text-[10px] text-muted-foreground">
    ▾
  </span>
)

export const optionRow =
  'flex min-h-8 w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-sm hover:bg-muted'

function OptionSearch({
  value,
  onChange,
  onEnter,
}: {
  value: string
  onChange: (value: string) => void
  onEnter?: () => void
}) {
  const { t } = useFormConfig()
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
      placeholder={t('search')}
      aria-label={t('searchOptions')}
      className="mb-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
    />
  )
}

export function Avatar({ option, size = 'sm' }: { option: OptionObject; size?: 'sm' | 'xs' }) {
  if (!option.avatar && !option.color) return null
  const cls = cn(
    'flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium',
    size === 'sm' ? 'size-6 text-[10px]' : 'size-4 text-[8px]',
  )
  if (option.avatar && /^(https?:|\/|data:)/.test(option.avatar)) {
    return <img src={option.avatar} alt="" className={cls} />
  }
  if (!option.avatar) {
    return (
      <span
        aria-hidden
        className="size-2 shrink-0 rounded-full"
        style={{ background: option.color }}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={cn(cls, 'bg-muted text-foreground')}
      style={option.color ? { background: option.color, color: 'white' } : undefined}
    >
      {option.avatar}
    </span>
  )
}

export function OptionView({ option, wrap = false }: { option: OptionObject; wrap?: boolean }) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      <Avatar option={option} />
      <span className="flex min-w-0 flex-col">
        <span className={wrap ? 'break-words' : 'truncate'}>{option.label}</span>
        {option.description && (
          <span className="text-xs text-muted-foreground">{option.description}</span>
        )}
      </span>
    </span>
  )
}

const filterOptions = (options: OptionObject[], query: string) => {
  const q = query.toLowerCase()
  return options.filter(
    (o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q),
  )
}

type BaseProps<T> = {
  id: string
  value: T
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  onChange: (value: T) => void
}

export function SelectField({
  id,
  value,
  options,
  placeholder,
  disabled,
  invalid,
  describedBy,
  onChange,
}: BaseProps<string> & { options: Option[]; placeholder?: string }) {
  const { t } = useFormConfig()
  const [query, setQuery] = useState('')
  const all = normalizeOptions(options)
  const shown = filterOptions(all, query)
  const selected = all.find((o) => o.value === value)

  return (
    <Popover
      block
      className="w-full"
      trigger={({ open, toggle }) => (
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          data-invalid={invalid || undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          onClick={toggle}
          className={cn(triggerClass, 'data-invalid:border-destructive')}
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-2">
              <Avatar option={selected} size="xs" />
              <span className="truncate">{selected.label}</span>
            </span>
          ) : (
            <span className="truncate text-muted-foreground">
              {value || (placeholder ?? t('select'))}
            </span>
          )}
          {!disabled && chevron}
        </button>
      )}
    >
      {(close) => (
        <>
          {all.length > 7 && <OptionSearch value={query} onChange={setQuery} />}
          <ul role="listbox" className="max-h-64 overflow-y-auto">
            {shown.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    onChange(option.value === value ? '' : option.value)
                    setQuery('')
                    close()
                  }}
                  className={optionRow}
                >
                  <OptionView option={option} />
                  {option.value === value && <span aria-hidden>✓</span>}
                </button>
              </li>
            ))}
            {!shown.length && (
              <li className="px-2 py-1.5 text-sm text-muted-foreground">{t('noMatchesShort')}</li>
            )}
          </ul>
        </>
      )}
    </Popover>
  )
}

export function Check({ on, round = false }: { on: boolean; round?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-4 shrink-0 items-center justify-center border text-[10px] transition-colors',
        round ? 'rounded-full' : 'rounded',
        on ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card',
      )}
    >
      {on && (round ? <span className="size-1.5 rounded-full bg-current" /> : '✓')}
    </span>
  )
}

export function MultiSelectField({
  id,
  value,
  options,
  creatable = false,
  display,
  placeholder,
  disabled,
  invalid,
  describedBy,
  onChange,
}: BaseProps<string[]> & {
  options: Option[]
  creatable?: boolean
  display?: 'checkboxes' | string
  placeholder?: string
}) {
  const { t } = useFormConfig()
  const [query, setQuery] = useState('')
  const base = normalizeOptions(options)
  const all = [
    ...base,
    ...value.filter((v) => !base.some((o) => o.value === v)).map((v) => ({ value: v, label: v })),
  ]
  const shown = filterOptions(all, query)
  const toggle = (option: string) =>
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option])

  if (display === 'checkboxes') {
    return (
      <div
        id={id}
        role="group"
        aria-describedby={describedBy}
        className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-x-3 gap-y-1.5"
      >
        {all.map((option) => {
          const on = value.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              role="checkbox"
              aria-checked={on}
              disabled={disabled}
              onClick={() => toggle(option.value)}
              className="flex items-start gap-2 rounded-lg py-1 text-left text-sm disabled:cursor-default"
            >
              <span className="pt-0.5">
                <Check on={on} />
              </span>
              <OptionView option={option} wrap />
            </button>
          )
        })}
      </div>
    )
  }

  const create = () => {
    const text = query.trim()
    if (!creatable || !text || all.some((o) => o.label === text)) return
    onChange([...value, text])
    setQuery('')
  }

  return (
    <Popover
      block
      className="w-full"
      trigger={({ open, toggle: toggleOpen }) => (
        <div
          id={id}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-disabled={disabled || undefined}
          data-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onClick={() => !disabled && toggleOpen()}
          onKeyDown={(e) => !disabled && (e.key === 'Enter' || e.key === ' ') && toggleOpen()}
          className={cn(triggerClass, 'flex-wrap justify-start data-invalid:border-destructive')}
        >
          {value.map((v) => {
            const option = all.find((o) => o.value === v) ?? { value: v, label: v }
            return (
              <span
                key={v}
                className="flex items-center gap-1 rounded-md bg-muted py-0.5 pr-1 pl-1.5 text-xs"
              >
                <Avatar option={option} size="xs" />
                {option.label}
                {!disabled && (
                  <button
                    type="button"
                    aria-label={t('removeOption', { label: option.label })}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggle(v)
                    }}
                    className="px-0.5 text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                )}
              </span>
            )
          })}
          {!value.length && (
            <span className="text-muted-foreground">{placeholder ?? t('add')}</span>
          )}
          {!disabled && <span className="ml-auto">{chevron}</span>}
        </div>
      )}
    >
      <OptionSearch value={query} onChange={setQuery} onEnter={create} />
      <ul role="listbox" aria-multiselectable className="max-h-64 overflow-y-auto">
        {shown.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              role="option"
              aria-selected={value.includes(option.value)}
              onClick={() => toggle(option.value)}
              className={optionRow}
            >
              <Check on={value.includes(option.value)} />
              <OptionView option={option} />
            </button>
          </li>
        ))}
        {creatable && query.trim() && !all.some((o) => o.label === query.trim()) && (
          <li>
            <button type="button" onClick={create} className={optionRow}>
              {t('createOption', { value: query.trim() })}
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
  disabled,
  describedBy,
  onChange,
}: BaseProps<boolean> & { label?: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={value}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className="flex min-h-8 items-center gap-2.5 text-sm disabled:cursor-default disabled:opacity-70"
    >
      <span
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors',
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
  display,
  disabled,
  describedBy,
  onChange,
}: BaseProps<string> & { options: Option[]; display?: string }) {
  const all = normalizeOptions(options)
  const cards = display === 'cards' || (display !== 'segmented' && all.some((o) => o.description))

  if (cards) {
    return (
      <div
        id={id}
        role="radiogroup"
        aria-describedby={describedBy}
        className="flex flex-col gap-1.5"
      >
        {all.map((option) => {
          const on = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex items-start gap-2.5 rounded-lg border p-2.5 text-left text-sm transition-colors disabled:cursor-default',
                on ? 'border-foreground bg-muted/50' : 'hover:border-ring',
              )}
            >
              <span className="pt-0.5">
                <Check on={on} round />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-medium">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      id={id}
      role="radiogroup"
      aria-describedby={describedBy}
      className="flex rounded-lg bg-muted p-0.5"
    >
      {all.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={cn(
            'h-7 flex-1 truncate rounded-md px-2 text-sm transition-colors disabled:cursor-default',
            value === option.value
              ? 'bg-card font-medium text-foreground shadow-(--shadow-button)'
              : 'text-muted-foreground enabled:hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function ListField({
  id,
  value,
  placeholder,
  disabled,
  describedBy,
  onChange,
}: BaseProps<string[]> & { placeholder?: string }) {
  const { t } = useFormConfig()
  const [draft, setDraft] = useState('')
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const add = () => {
    const text = draft.trim()
    if (!text) return
    onChange([...value, text])
    setDraft('')
  }

  return (
    <div id={id} aria-describedby={describedBy} className="flex flex-col gap-1.5">
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-4 text-right text-xs text-muted-foreground tabular-nums">{i + 1}</span>
          <input
            ref={(el) => {
              inputs.current[i] = el
            }}
            value={item}
            readOnly={disabled}
            aria-label={t('itemN', { n: i + 1 })}
            onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !item) {
                e.preventDefault()
                onChange(value.filter((_, j) => j !== i))
                inputs.current[i - 1]?.focus()
              }
            }}
            className="h-8 min-w-0 flex-1 rounded-lg border border-input bg-card px-2.5 text-sm outline-none read-only:bg-muted/40 focus:border-ring"
          />
          {!disabled && (
            <button
              type="button"
              aria-label={t('removeItemN', { n: i + 1 })}
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="flex size-8 items-center justify-center rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      {!disabled && (
        <div className="flex items-center gap-2">
          <span className="w-4 text-right text-xs text-muted-foreground">+</span>
          <input
            value={draft}
            placeholder={placeholder ?? t('listPlaceholder')}
            aria-label={t('newItem')}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={add}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                add()
              }
            }}
            className="h-8 min-w-0 flex-1 rounded-lg border border-dashed border-input bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-solid focus:border-ring"
          />
        </div>
      )}
    </div>
  )
}
