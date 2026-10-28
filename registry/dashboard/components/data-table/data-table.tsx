'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { Popover } from './popover'

export type Column<T> = {
  key: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  sortValue?: (row: T) => string | number
  sortLabel?: string
  align?: 'left' | 'right'
  className?: string
}

export type View<T> = { label: string; filter: (row: T) => boolean }

export type Filter<T> = {
  key: string
  label: string
  options: string[]
  value: (row: T) => string
}

type Sort = { key: string; direction: 'asc' | 'desc' }

type DataTableProps<T> = {
  rows: T[]
  columns: Column<T>[]
  getRowId: (row: T) => string
  views?: View<T>[]
  filters?: Filter<T>[]
  searchText?: (row: T) => string
  searchPlaceholder?: string
  defaultSort?: Sort
  selectable?: boolean
  bulkActions?: (selected: string[]) => React.ReactNode
  pageSize?: number
  pageSizeOptions?: number[]
  onRefresh?: () => void | Promise<void>
  loading?: boolean
  skeletonRows?: number
  empty?: React.ReactNode
  className?: string
}

const iconButton =
  'bg-card text-foreground hover:bg-muted inline-flex size-8 items-center justify-center rounded-lg shadow-(--shadow-button) [&_svg]:size-4'

function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  label,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="block size-4 cursor-pointer accent-primary dark:scheme-dark"
    />
  )
}

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  views = [],
  filters = [],
  searchText,
  searchPlaceholder = 'Search',
  defaultSort,
  selectable = false,
  bulkActions,
  pageSize,
  pageSizeOptions = [10, 25, 50],
  onRefresh,
  loading = false,
  skeletonRows = 4,
  empty = 'No results',
  className,
}: DataTableProps<T>) {
  const [view, setView] = useState(-1)
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [applied, setApplied] = useState<Record<string, string[]>>({})
  const [sort, setSort] = useState<Sort | undefined>(defaultSort)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(pageSize ?? 0)
  const [refreshing, setRefreshing] = useState(false)

  const sortable = columns.filter((c) => c.sortValue)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const text = searchText ?? ((row: T) => Object.values(row as object).join(' '))
    const result = rows.filter(
      (row) =>
        (view < 0 || views[view].filter(row)) &&
        (!q || text(row).toLowerCase().includes(q)) &&
        filters.every((f) => !applied[f.key]?.length || applied[f.key].includes(f.value(row))),
    )
    const column = sort && columns.find((c) => c.key === sort.key)
    if (!column?.sortValue || !sort) return result
    const value = column.sortValue
    return [...result].sort((a, b) => {
      const [x, y] = [value(a), value(b)]
      const order = x < y ? -1 : x > y ? 1 : 0
      return sort.direction === 'asc' ? order : -order
    })
  }, [rows, columns, views, view, filters, applied, query, searchText, sort])

  const pageCount = limit ? Math.max(1, Math.ceil(visible.length / limit)) : 1
  const current = Math.min(page, pageCount - 1)
  const pageRows = limit ? visible.slice(current * limit, (current + 1) * limit) : visible
  const span = columns.length + (selectable ? 1 : 0)

  const visibleIds = pageRows.map(getRowId)
  const selectedVisible = visibleIds.filter((id) => selected.has(id))
  const allSelected = visibleIds.length > 0 && selectedVisible.length === visibleIds.length

  const toggleAll = (checked: boolean) => setSelected(checked ? new Set(visibleIds) : new Set())

  const toggleRow = (id: string, checked: boolean) => {
    const next = new Set(selected)
    if (checked) next.add(id)
    else next.delete(id)
    setSelected(next)
  }

  const toggleFilter = (key: string, option: string) => {
    const active = applied[key] ?? []
    setPage(0)
    setApplied({
      ...applied,
      [key]: active.includes(option) ? active.filter((o) => o !== option) : [...active, option],
    })
  }

  const refresh = async () => {
    if (!onRefresh) return
    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setRefreshing(false)
    }
  }

  const sortBy = (key: string) =>
    setSort(
      sort?.key === key
        ? { key, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    )

  const stopSearching = () => {
    setSearching(false)
    setQuery('')
    setApplied({})
    setPage(0)
  }

  return (
    <div
      className={cn('rounded-xl bg-card text-card-foreground shadow-(--shadow-card)', className)}
    >
      <div className="flex min-h-12 items-center gap-2 border-b px-2 py-1.5">
        {searching ? (
          <div className="flex flex-1 items-center gap-2">
            <label className="flex h-8 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-2.5 focus-within:border-ring">
              <SearchIcon />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(0)
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            <button
              type="button"
              onClick={stopSearching}
              className="h-8 rounded-lg px-3 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div role="tablist" className="flex flex-1 gap-0.5 overflow-x-auto">
            {[{ label: 'All' }, ...views].map((v, i) => (
              <button
                key={v.label}
                type="button"
                role="tab"
                aria-selected={view === i - 1}
                onClick={() => {
                  setView(i - 1)
                  setPage(0)
                  setSelected(new Set())
                }}
                className={cn(
                  'h-8 shrink-0 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors',
                  view === i - 1
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}
        {!searching && (
          <button
            type="button"
            aria-label="Search and filter"
            onClick={() => setSearching(true)}
            className={cn(iconButton, 'w-12 gap-0.5')}
          >
            <SearchIcon />
            <FilterIcon />
          </button>
        )}
        {onRefresh && (
          <button
            type="button"
            aria-label="Refresh"
            disabled={refreshing}
            onClick={refresh}
            className={cn(iconButton, 'disabled:opacity-60')}
          >
            <RefreshIcon spinning={refreshing} />
          </button>
        )}
        {sortable.length > 0 && (
          <Popover
            align="end"
            trigger={({ toggle, open }) => (
              <button
                type="button"
                aria-label="Sort"
                aria-expanded={open}
                onClick={toggle}
                className={iconButton}
              >
                <SortIcon />
              </button>
            )}
          >
            <p className="px-2 pt-1 pb-2 text-xs font-medium text-muted-foreground">Sort by</p>
            {sortable.map((c) => (
              <label
                key={c.key}
                className="flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm hover:bg-muted"
              >
                <input
                  type="radio"
                  name="sort"
                  checked={sort?.key === c.key}
                  onChange={() => setSort({ key: c.key, direction: sort?.direction ?? 'asc' })}
                  className="accent-primary dark:scheme-dark"
                />
                {c.sortLabel ?? c.header}
              </label>
            ))}
            <div className="mt-1.5 grid grid-cols-2 gap-1 border-t pt-1.5">
              {(['asc', 'desc'] as const).map((direction) => (
                <button
                  key={direction}
                  type="button"
                  disabled={!sort}
                  onClick={() => sort && setSort({ ...sort, direction })}
                  className={cn(
                    'h-8 rounded-lg text-sm hover:bg-muted disabled:opacity-50',
                    sort?.direction === direction && 'bg-muted font-medium',
                  )}
                >
                  {direction === 'asc' ? '↑ Ascending' : '↓ Descending'}
                </button>
              ))}
            </div>
          </Popover>
        )}
      </div>

      {searching && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b px-3 py-2">
          {filters.map((f) => {
            const active = applied[f.key] ?? []
            return (
              <Popover
                key={f.key}
                trigger={({ toggle, open }) => (
                  <span
                    className={cn(
                      'inline-flex h-7 items-center rounded-full border text-xs font-medium',
                      active.length ? 'border-transparent bg-muted' : 'border-dashed',
                    )}
                  >
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={toggle}
                      className="flex h-full items-center gap-1 pr-1.5 pl-3"
                    >
                      {f.label}
                      {active.length > 0 && (
                        <span className="text-muted-foreground">: {active.join(', ')}</span>
                      )}
                      <span aria-hidden className="text-muted-foreground">
                        ▾
                      </span>
                    </button>
                    {active.length > 0 && (
                      <button
                        type="button"
                        aria-label={`Clear ${f.label}`}
                        onClick={() => setApplied({ ...applied, [f.key]: [] })}
                        className="h-full pr-2.5 text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    )}
                  </span>
                )}
              >
                {f.options.map((option) => (
                  <label
                    key={option}
                    className="flex h-8 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      checked={active.includes(option)}
                      onChange={() => toggleFilter(f.key, option)}
                      className="size-4 accent-primary dark:scheme-dark"
                    />
                    {option}
                  </label>
                ))}
              </Popover>
            )
          })}
          {Object.values(applied).some((v) => v.length) && (
            <button
              type="button"
              onClick={() => setApplied({})}
              className="px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-b-xl">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr className="h-10 border-b">
              {selectable && (
                <th className="w-10 pl-3 text-left align-middle">
                  <Checkbox
                    label="Select all rows"
                    checked={allSelected}
                    indeterminate={selectedVisible.length > 0 && !allSelected}
                    onChange={toggleAll}
                  />
                </th>
              )}
              {selectable && selectedVisible.length > 0 ? (
                <th colSpan={columns.length} className="px-3 text-left font-medium">
                  <div className="flex items-center gap-3">
                    <span className="text-foreground">{selectedVisible.length} selected</span>
                    {bulkActions?.(selectedVisible)}
                  </div>
                </th>
              ) : (
                columns.map((c) => (
                  <th
                    key={c.key}
                    aria-sort={
                      sort?.key === c.key
                        ? sort.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    className={cn(
                      'px-3 font-medium whitespace-nowrap',
                      c.align === 'right' ? 'text-right' : 'text-left',
                      c.className,
                    )}
                  >
                    {c.sortValue ? (
                      <button
                        type="button"
                        onClick={() => sortBy(c.key)}
                        className={cn(
                          'inline-flex items-center gap-1 hover:text-foreground',
                          sort?.key === c.key && 'text-foreground',
                        )}
                      >
                        {c.header}
                        <span aria-hidden className="text-[10px]">
                          {sort?.key === c.key ? (sort.direction === 'asc' ? '▲' : '▼') : '⇅'}
                        </span>
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: limit || skeletonRows }, (_, i) => (
                  <tr key={i} className="h-11 border-b last:border-0">
                    {selectable && (
                      <td className="w-10 pl-3 align-middle">
                        <span className="block size-4 rounded bg-muted" />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.key} className="px-3">
                        <span
                          className={cn(
                            'block h-3 animate-pulse rounded-full bg-muted',
                            c.align === 'right' ? 'ml-auto w-14' : 'w-24',
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              : pageRows.map((row) => {
                  const id = getRowId(row)
                  const isSelected = selected.has(id)
                  return (
                    <tr
                      key={id}
                      data-selected={isSelected}
                      className="h-11 border-b transition-colors last:border-0 hover:bg-muted/50 data-[selected=true]:bg-muted"
                    >
                      {selectable && (
                        <td className="w-10 pl-3 align-middle">
                          <Checkbox
                            label={`Select row ${id}`}
                            checked={isSelected}
                            onChange={(checked) => toggleRow(id, checked)}
                          />
                        </td>
                      )}
                      {columns.map((c) => (
                        <td
                          key={c.key}
                          className={cn(
                            'px-3 whitespace-nowrap',
                            c.align === 'right' && 'text-right tabular-nums',
                            c.className,
                          )}
                        >
                          {c.cell(row)}
                        </td>
                      ))}
                    </tr>
                  )
                })}
            {!loading && visible.length === 0 && (
              <tr>
                <td colSpan={span} className="h-32 text-center text-sm text-muted-foreground">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {limit > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-3 py-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              Rows
              <Popover
                side="top"
                className="min-w-24"
                trigger={({ open, toggle }) => (
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-label={`Rows per page: ${limit}`}
                    onClick={toggle}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-card px-2.5 font-medium text-foreground tabular-nums shadow-(--shadow-button) hover:bg-muted"
                  >
                    {limit}
                    <span aria-hidden className="text-[10px] text-muted-foreground">
                      ▾
                    </span>
                  </button>
                )}
              >
                {(close) => (
                  <ul role="listbox" aria-label="Rows per page">
                    {[...new Set([...pageSizeOptions, pageSize ?? limit])]
                      .sort((x, y) => x - y)
                      .map((n) => (
                        <li key={n}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={n === limit}
                            onClick={() => {
                              setLimit(n)
                              setPage(0)
                              close()
                            }}
                            className="flex h-8 w-full items-center justify-between gap-3 rounded-lg px-2 text-sm text-foreground tabular-nums hover:bg-muted"
                          >
                            {n}
                            {n === limit && <span aria-hidden>✓</span>}
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </Popover>
            </span>
            {!loading && visible.length > 0 && (
              <span className="tabular-nums">
                {current * limit + 1}–{Math.min((current + 1) * limit, visible.length)} of{' '}
                {visible.length}
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {(
              [
                ['first', 'First page', 0, current === 0],
                ['left', 'Previous page', current - 1, current === 0],
                ['right', 'Next page', current + 1, current >= pageCount - 1],
                ['last', 'Last page', pageCount - 1, current >= pageCount - 1],
              ] as const
            ).map(([direction, label, target, disabled]) => (
              <button
                key={direction}
                type="button"
                aria-label={label}
                disabled={disabled || loading}
                onClick={() => setPage(target)}
                className={cn(iconButton, 'disabled:opacity-40')}
              >
                <ChevronIcon direction={direction} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={cn('size-4', spinning && 'animate-spin')}
    >
      <path
        d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const chevrons = {
  first: 'M12 3 7 8l5 5M7.5 3 2.5 8l5 5',
  left: 'M10 3 5 8l5 5',
  right: 'm6 3 5 5-5 5',
  last: 'm4 3 5 5-5 5m4.5-10 5 5-5 5',
}

function ChevronIcon({ direction }: { direction: keyof typeof chevrons }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-4">
      <path
        d={chevrons[direction]}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="size-4 shrink-0 text-muted-foreground"
    >
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-4">
      <path
        d="M2.5 4.5h11M4.5 8h7M6.5 11.5h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SortIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-4">
      <path
        d="M5 13V3M5 3 2.5 5.5M5 3l2.5 2.5M11 3v10m0 0 2.5-2.5M11 13l-2.5-2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
