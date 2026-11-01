'use client'

import { useId, useRef, useState } from 'react'
import { Loader2, MapPin, Search } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Avatar, Check, OptionView, optionRow, triggerClass } from './controls'
import { useFormConfig } from './context'
import { Popover } from '@/registry/dashboard/components/popover/popover'
import { findOption, rememberOptions, type Option, type OptionObject } from './schema'

type Status = 'idle' | 'loading' | 'done' | 'error'

function useSearch(search?: (query: string) => Promise<OptionObject[]>) {
  const [items, setItems] = useState<OptionObject[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef(0)

  const run = (query: string, delay = 250) => {
    if (!search) return
    if (timer.current) clearTimeout(timer.current)
    const id = ++latest.current
    setStatus('loading')
    timer.current = setTimeout(() => {
      search(query).then(
        (found) => {
          if (id !== latest.current) return
          rememberOptions(found)
          setItems(found)
          setStatus('done')
        },
        () => id === latest.current && setStatus('error'),
      )
    }, delay)
  }

  return { items, status, run }
}

function Results({
  listId,
  items,
  status,
  query,
  active,
  selected,
  multiple,
  onPick,
  onRetry,
  onHover,
}: {
  listId: string
  items: OptionObject[]
  status: Status
  query: string
  active: number
  selected: string[]
  multiple?: boolean
  onPick: (option: OptionObject) => void
  onRetry: () => void
  onHover: (index: number) => void
}) {
  const { t } = useFormConfig()
  if (status === 'error')
    return (
      <div className="flex items-center justify-between gap-2 px-2 py-2 text-sm text-muted-foreground">
        {t('loadFailed')}
        <button
          type="button"
          onClick={onRetry}
          className="font-medium text-foreground hover:underline"
        >
          {t('tryAgain')}
        </button>
      </div>
    )
  return (
    <ul
      id={listId}
      role="listbox"
      aria-multiselectable={multiple}
      className="max-h-64 overflow-y-auto"
    >
      {status === 'loading' && !items.length && (
        <li className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> {t('searching')}
        </li>
      )}
      {items.map((option, i) => {
        const on = selected.includes(option.value)
        return (
          <li key={option.value}>
            <button
              type="button"
              role="option"
              id={`${listId}-${i}`}
              aria-selected={on}
              tabIndex={-1}
              onMouseEnter={() => onHover(i)}
              onClick={() => onPick(option)}
              className={cn(optionRow, i === active && 'bg-muted')}
            >
              {multiple && <Check on={on} />}
              <OptionView option={option} />
              {!multiple && on && <span aria-hidden>✓</span>}
            </button>
          </li>
        )
      })}
      {status === 'done' && !items.length && (
        <li className="px-2 py-2 text-sm text-muted-foreground">
          {query.trim() ? t('noMatches', { query: query.trim() }) : t('startTyping')}
        </li>
      )}
      {status === 'loading' && items.length > 0 && (
        <li className="flex items-center gap-2 px-2 pt-1 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" /> {t('updating')}
        </li>
      )}
    </ul>
  )
}

export function LookupField({
  id,
  value,
  multiple = false,
  search,
  options = [],
  placeholder,
  disabled,
  invalid,
  describedBy,
  onChange,
}: {
  id: string
  value: string | string[]
  multiple?: boolean
  search?: (query: string) => Promise<OptionObject[]>
  options?: Option[]
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  onChange: (value: string | string[]) => void
}) {
  const listId = useId()
  const { t } = useFormConfig()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const { items, status, run } = useSearch(search)
  const selected = Array.isArray(value) ? value : value ? [value] : []
  const label = (v: string) => findOption({ options }, v) ?? { value: v, label: v }

  const pick = (option: OptionObject, close: () => void) => {
    rememberOptions([option])
    if (multiple) {
      onChange(
        selected.includes(option.value)
          ? selected.filter((v) => v !== option.value)
          : [...selected, option.value],
      )
    } else {
      onChange(option.value === value ? '' : option.value)
      close()
    }
  }

  return (
    <Popover
      block
      className="w-full min-w-64"
      trigger={({ open, toggle }) => (
        <div
          id={id}
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-disabled={disabled || undefined}
          aria-describedby={describedBy}
          data-invalid={invalid || undefined}
          onClick={() => {
            if (disabled) return
            if (!open) {
              setQuery('')
              setActive(0)
              run('', 0)
            }
            toggle()
          }}
          onKeyDown={(e) => {
            if (disabled || open || !['Enter', ' ', 'ArrowDown'].includes(e.key)) return
            e.preventDefault()
            setQuery('')
            run('', 0)
            toggle()
          }}
          className={cn(
            triggerClass,
            'cursor-pointer justify-start data-invalid:border-destructive',
            multiple && 'flex-wrap',
          )}
        >
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          {selected.length === 0 && (
            <span className="truncate text-muted-foreground">{placeholder ?? t('search')}</span>
          )}
          {!multiple && selected[0] && (
            <span className="flex min-w-0 items-center gap-2">
              <Avatar option={label(selected[0])} size="xs" />
              <span className="truncate">{label(selected[0]).label}</span>
            </span>
          )}
          {multiple &&
            selected.map((v) => (
              <span
                key={v}
                className="flex items-center gap-1 rounded-md bg-muted py-0.5 pr-1 pl-1.5 text-xs"
              >
                <Avatar option={label(v)} size="xs" />
                {label(v).label}
                {!disabled && (
                  <button
                    type="button"
                    aria-label={t('removeOption', { label: label(v).label })}
                    onClick={(e) => {
                      e.stopPropagation()
                      onChange(selected.filter((s) => s !== v))
                    }}
                    className="px-0.5 text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                )}
              </span>
            ))}
        </div>
      )}
    >
      {(close) => (
        <>
          <input
            autoFocus
            value={query}
            placeholder={t('typeToSearch')}
            aria-label={t('search')}
            aria-controls={listId}
            aria-activedescendant={items[active] ? `${listId}-${active}` : undefined}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
              run(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive(Math.min(items.length - 1, active + 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive(Math.max(0, active - 1))
              } else if (e.key === 'Enter' && items[active]) {
                e.preventDefault()
                pick(items[active], close)
              }
            }}
            className="mb-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus:border-ring"
          />
          <Results
            listId={listId}
            items={items}
            status={status}
            query={query}
            active={active}
            selected={selected}
            multiple={multiple}
            onPick={(o) => pick(o, close)}
            onRetry={() => run(query, 0)}
            onHover={setActive}
          />
        </>
      )}
    </Popover>
  )
}

export function AddressField({
  id,
  value,
  search,
  placeholder,
  disabled,
  invalid,
  describedBy,
  onChange,
}: {
  id: string
  value: string
  search?: (query: string) => Promise<OptionObject[]>
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  onChange: (value: string) => void
}) {
  const listId = useId()
  const { t } = useFormConfig()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const { items, status, run } = useSearch(search)
  const show = open && value.trim().length >= 3 && status !== 'idle'

  const choose = (option: OptionObject) => {
    onChange(option.label)
    setOpen(false)
  }

  return (
    <div className="relative w-full">
      <div className="flex h-8 w-full min-w-0 items-center gap-2 rounded-lg border border-input bg-card px-2.5 text-sm focus-within:border-ring has-read-only:bg-muted/40 has-aria-invalid:border-destructive">
        <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          id={id}
          role="combobox"
          aria-expanded={show}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={show && items[active] ? `${listId}-${active}` : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          autoComplete="off"
          readOnly={disabled}
          value={value}
          placeholder={placeholder ?? t('addressPlaceholder')}
          onChange={(e) => {
            onChange(e.target.value)
            setActive(-1)
            setOpen(true)
            if (e.target.value.trim().length >= 3) run(e.target.value)
          }}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (!show) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive(Math.min(items.length - 1, active + 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive(Math.max(0, active - 1))
            } else if (e.key === 'Enter' && items[active]) {
              e.preventDefault()
              choose(items[active])
            } else if (e.key === 'Escape') setOpen(false)
          }}
          className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        {status === 'loading' && open && (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
        )}
      </div>
      {show && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-full min-w-64 rounded-xl bg-popover p-1.5 text-popover-foreground shadow-(--shadow-overlay)">
          <Results
            listId={listId}
            items={items}
            status={status}
            query={value}
            active={active}
            selected={[]}
            onPick={choose}
            onRetry={() => run(value, 0)}
            onHover={setActive}
          />
        </div>
      )}
    </div>
  )
}
