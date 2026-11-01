'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { ChevronRight, Copy, GripVertical, Plus, Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { parseDate } from '@/registry/dashboard/components/date-picker/date-picker'
import { toInputValue } from '@/registry/dashboard/components/date-range-picker/dates'
import { Field } from '@/registry/dashboard/components/input/input'
import { toast } from '@/registry/dashboard/components/toast/toast'

import { Check } from './controls'
import { useFormConfig } from './context'
import type { FieldControlProps } from './field-control'
import {
  applyAction,
  cloneItem,
  ItemMenu,
  move,
  newItem,
  UndoBar,
  useUndo,
  type ItemAction,
} from './items'
import {
  isReadOnly,
  isRequired,
  isVisible,
  normalizeOptions,
  scope,
  type FieldDef,
  type FieldValue,
  type Row,
} from './schema'

export type NestedProps = FieldControlProps & {
  Control: React.ComponentType<FieldControlProps>
}

const cellWidth: Record<string, string> = {
  date: 'min-w-40',
  datetime: 'min-w-52',
  daterange: 'min-w-56',
  time: 'min-w-32',
  month: 'min-w-36',
  select: 'min-w-32',
  multiselect: 'min-w-40',
  lookup: 'min-w-44',
  phone: 'min-w-48',
  number: 'min-w-20',
  currency: 'min-w-28',
  percent: 'min-w-24',
  duration: 'min-w-28',
  toggle: 'min-w-14',
}

const PASTEABLE = new Set([
  'text',
  'email',
  'url',
  'phone',
  'textarea',
  'number',
  'currency',
  'percent',
  'select',
  'radio',
  'date',
  'toggle',
])

function fromPaste(col: FieldDef, raw: string): FieldValue | undefined {
  const t = raw.trim()
  switch (col.type) {
    case 'number':
    case 'currency':
    case 'percent':
      return t.replace(/[^\d.-]/g, '')
    case 'toggle':
      return /^(y|yes|true|1|x|✓|✔)$/i.test(t)
    case 'select':
    case 'radio': {
      const match = normalizeOptions(col.options).find(
        (o) =>
          o.value.toLowerCase() === t.toLowerCase() || o.label.toLowerCase() === t.toLowerCase(),
      )
      return match ? match.value : undefined
    }
    case 'date': {
      const d = parseDate(t)
      return d ? toInputValue(d) : undefined
    }
    default:
      return t
  }
}

export const hasErrorUnder = (errors: Record<string, string>, prefix: string) =>
  Object.keys(errors).some((k) => errors[k] && k.startsWith(`${prefix}.`))

export function RowsField({ Control, ...props }: NestedProps) {
  const {
    id,
    field,
    value,
    values,
    disabled,
    describedBy,
    onChange,
    currency = '$',
    errors = {},
    fieldTypes,
    path = field.name,
  } = props
  const { t, roles } = useFormConfig()
  const columns = field.columns ?? []
  const details = field.details ?? []
  const all = [...columns, ...details]
  const rows = Array.isArray(value) ? (value as Row[]) : []
  const canAdd = !disabled && (field.maxLength === undefined || rows.length < field.maxLength)

  const [selected, setSelected] = useState<string[]>([])
  const [open, setOpen] = useState<string[]>([])
  const [compact, setCompact] = useState(false)
  const [width, setWidth] = useState(0)
  const [drag, setDrag] = useState<{ from: number; over: number } | null>(null)
  const [armed, setArmed] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const wrap = useRef<HTMLDivElement>(null)
  const pendingFocus = useRef<number | null>(null)
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { undo, offer, dismiss } = useUndo()

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setCompact(entry.contentRect.width < 560)
      setWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const index = pendingFocus.current
    if (index === null) return
    pendingFocus.current = null
    wrap.current
      ?.querySelector<HTMLElement>(
        `[data-row="${index}"] [data-cell] :is(input:not([type=file]), textarea, button, [role=combobox])`,
      )
      ?.focus()
  }, [value])

  const ctxOf = (row: Row) => scope(values, row)
  const cellValue = (row: Row, col: FieldDef) =>
    col.compute ? col.compute(ctxOf(row)) : row[col.name]
  const blank = () => newItem(all)
  const setCell = (i: number, name: string, v: FieldValue) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [name]: v } : r)))

  const flash = (text: string) => {
    if (toast.isMounted()) return void toast.success(text)
    setNote(text)
    if (noteTimer.current) clearTimeout(noteTimer.current)
    noteTimer.current = setTimeout(() => setNote(''), 4000)
  }

  const remove = (ids: string[]) => {
    const before = rows
    onChange(rows.filter((r) => !ids.includes(r.id)))
    setSelected((s) => s.filter((x) => !ids.includes(x)))
    offer(
      ids.length === 1
        ? t('rowDeleted', { n: before.findIndex((r) => r.id === ids[0]) + 1 })
        : t('rowsDeleted', { count: ids.length }),
      () => onChange(before),
    )
  }

  const act = (i: number, action: ItemAction) => {
    if (action === 'delete') return remove([rows[i].id])
    const result = applyAction(rows, i, action, blank)
    pendingFocus.current = result.focus
    onChange(result.list)
  }

  const add = () => {
    pendingFocus.current = rows.length
    onChange([...rows, blank()])
  }

  const duplicateSelected = () => {
    const next: Row[] = []
    for (const r of rows) {
      next.push(r)
      if (selected.includes(r.id)) next.push(cloneItem(r))
    }
    onChange(field.maxLength !== undefined ? next.slice(0, field.maxLength) : next)
    setSelected([])
  }

  const paste = (e: React.ClipboardEvent) => {
    if (disabled) return
    const cell = (e.target as HTMLElement).closest<HTMLElement>('[data-cell]')
    if (!cell || cell.closest('[data-nested]') !== e.currentTarget.closest('[data-nested]')) return
    const text = e.clipboardData.getData('text/plain')
    if (!/[\t\n]/.test(text.trim())) return
    e.preventDefault()
    const grid = text
      .replace(/\r/g, '')
      .replace(/\n+$/, '')
      .split('\n')
      .map((line) => line.split('\t'))
    const r0 = Number(cell.dataset.row)
    const c0 = Number(cell.dataset.col)
    const next = [...rows]
    let added = 0
    let filled = 0
    grid.forEach((cells, dr) => {
      const ri = r0 + dr
      if (ri >= next.length) {
        if (field.maxLength !== undefined && next.length >= field.maxLength) return
        next.push(blank())
        added++
      }
      const row = { ...next[ri] }
      cells.forEach((raw, dc) => {
        const col = columns[c0 + dc]
        if (!col || col.compute || col.readOnly || !PASTEABLE.has(col.type)) return
        const v = fromPaste(col, raw)
        if (v !== undefined) {
          row[col.name] = v
          filled++
        }
      })
      next[ri] = row
    })
    onChange(next)
    flash(
      `${t('pasted', { count: filled })}${added ? ` · ${t('rowsAdded', { count: added })}` : ''}`,
    )
  }

  const rowKeys = (i: number) => (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()
      e.stopPropagation()
      act(i, e.key === 'ArrowUp' ? 'up' : 'down')
    } else if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      target.tagName === 'INPUT' &&
      target.id.startsWith('field-') &&
      i === rows.length - 1 &&
      canAdd
    ) {
      e.preventDefault()
      e.stopPropagation()
      add()
    }
  }

  const control = (row: Row, i: number, col: FieldDef, j: number, label: boolean) => {
    const ctx = ctxOf(row)
    const key = `${path}.${i}.${col.name}`
    const error = errors[key]
    if (!isVisible(col, ctx, roles))
      return label ? null : <span className="px-2 text-muted-foreground">—</span>
    const node = (
      <Control
        id={`field-${key}`}
        path={key}
        field={label ? col : { ...col, label: `${col.label}, row ${i + 1}` }}
        value={cellValue(row, col)}
        values={ctx}
        invalid={!!error}
        disabled={!!disabled || isReadOnly(col, ctx, roles)}
        describedBy={error ? `field-${key}-error` : undefined}
        currency={currency}
        errors={errors}
        fieldTypes={fieldTypes}
        onChange={(v) => setCell(i, col.name, v)}
      />
    )
    if (label)
      return (
        <div
          key={col.name}
          data-cell
          data-row={i}
          data-col={j}
          className={cn(
            'min-w-0',
            (col.type === 'rows' ||
              col.type === 'group' ||
              col.type === 'textarea' ||
              col.type === 'richtext') &&
              'col-span-full',
          )}
        >
          <Field
            label={col.label}
            htmlFor={`field-${key}`}
            hint={col.hint ?? (col.compute ? t('calculated') : undefined)}
            error={error}
            required={!disabled && isRequired(col, ctx)}
          >
            {node}
          </Field>
        </div>
      )
    return (
      <>
        {node}
        {error && (
          <span id={`field-${key}-error`} className="mt-1 block text-xs text-destructive">
            {error}
          </span>
        )}
      </>
    )
  }

  const totals =
    field.totals?.length && rows.length
      ? field.totals.map((name) => {
          const col = columns.find((c) => c.name === name)
          const sum = rows.reduce((s, r) => s + (Number(col ? cellValue(r, col) : r[name]) || 0), 0)
          const text = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: col?.decimals ?? 2,
          }).format(sum)
          return {
            name,
            label: col?.label ?? name,
            text: `${col?.type === 'currency' ? currency : ''}${text}${col?.type === 'percent' ? '%' : ''}`,
          }
        })
      : null

  const allSelected = rows.length > 0 && selected.length === rows.length
  const toggleAll = () => setSelected(allSelected ? [] : rows.map((r) => r.id))
  const toggleOne = (rowId: string) =>
    setSelected((s) => (s.includes(rowId) ? s.filter((x) => x !== rowId) : [...s, rowId]))
  const detailHasError = (i: number) =>
    details.some((d) =>
      Object.keys(errors).some(
        (k) =>
          errors[k] && (k === `${path}.${i}.${d.name}` || k.startsWith(`${path}.${i}.${d.name}.`)),
      ),
    )
  const isOpen = (row: Row, i: number) => open.includes(row.id) || detailHasError(i)
  const toggleOpen = (rowId: string) =>
    setOpen((o) => (o.includes(rowId) ? o.filter((x) => x !== rowId) : [...o, rowId]))

  const checkbox = (on: boolean, label: string, onToggle: () => void) => (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className="flex size-6 items-center justify-center rounded"
    >
      <Check on={on} />
    </button>
  )

  const span = (disabled ? 0 : 2) + 1 + (details.length ? 1 : 0) + columns.length

  return (
    <div
      ref={wrap}
      id={id}
      data-nested
      aria-describedby={describedBy}
      className="flex min-w-0 flex-col gap-2"
      onPaste={paste}
    >
      {selected.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-muted px-2 py-1.5 text-sm">
          <span className="px-1 font-medium tabular-nums">
            {t('selected', { count: selected.length })}
          </span>
          {canAdd && (
            <button
              type="button"
              onClick={duplicateSelected}
              className="flex h-7 items-center gap-1.5 rounded-md px-2 hover:bg-card [&_svg]:size-3.5"
            >
              <Copy /> {t('duplicate')}
            </button>
          )}
          <button
            type="button"
            onClick={() => remove(selected)}
            className="flex h-7 items-center gap-1.5 rounded-md px-2 text-destructive hover:bg-card [&_svg]:size-3.5"
          >
            <Trash2 /> {t('delete')}
          </button>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="ml-auto h-7 rounded-md px-2 text-muted-foreground hover:bg-card hover:text-foreground"
          >
            {t('clear')}
          </button>
        </div>
      )}

      {compact ? (
        <ul className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <li
              key={row.id}
              data-row={i}
              onKeyDown={rowKeys(i)}
              className={cn(
                'rounded-lg border bg-card p-3',
                selected.includes(row.id) && 'border-ring',
              )}
            >
              <div className="mb-3 flex items-center gap-2">
                {!disabled &&
                  checkbox(selected.includes(row.id), t('selectRow', { n: i + 1 }), () =>
                    toggleOne(row.id),
                  )}
                <span className="flex-1 text-sm font-medium">{t('rowLabel', { n: i + 1 })}</span>
                {!disabled && (
                  <ItemMenu
                    label={t('rowLabel', { n: i + 1 })}
                    index={i}
                    count={rows.length}
                    canAdd={canAdd}
                    onAction={(a) => act(i, a)}
                  />
                )}
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
                {all.map((col) => control(row, i, col, columns.indexOf(col), true))}
              </div>
            </li>
          ))}
          {!rows.length && (
            <li className="rounded-lg border border-dashed px-3 py-5 text-center text-sm text-muted-foreground">
              {t('noRows')}
            </li>
          )}
          {totals && (
            <li className="flex flex-wrap justify-end gap-x-4 gap-y-1 px-1 text-sm">
              {totals.map((t) => (
                <span key={t.name}>
                  <span className="text-muted-foreground">Total {t.label.toLowerCase()}: </span>
                  <span className="font-medium tabular-nums">{t.text}</span>
                </span>
              ))}
            </li>
          )}
        </ul>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                {!disabled && (
                  <th className="w-8 pl-1.5">{checkbox(allSelected, t('selectAll'), toggleAll)}</th>
                )}
                <th className="w-9 px-1 text-center font-medium">#</th>
                {details.length > 0 && <th className="w-7" aria-label="Details" />}
                {columns.map((c) => (
                  <th
                    key={c.name}
                    scope="col"
                    className="px-2 py-1.5 font-medium whitespace-nowrap"
                  >
                    {c.label}
                    {c.required && <span aria-hidden> *</span>}
                  </th>
                ))}
                {!disabled && <th className="w-9" aria-label="Actions" />}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const expanded = details.length > 0 && isOpen(row, i)
                const detailError = detailHasError(i)
                const dropping = drag && drag.over === i && drag.from !== i
                return (
                  <Fragment key={row.id}>
                    <tr
                      data-row={i}
                      draggable={armed === row.id}
                      onKeyDown={rowKeys(i)}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move'
                        e.dataTransfer.setData('text/plain', row.id)
                        setDrag({ from: i, over: i })
                      }}
                      onDragOver={(e) => {
                        if (!drag) return
                        e.preventDefault()
                        if (drag.over !== i) setDrag({ ...drag, over: i })
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (drag) onChange(move(rows, drag.from, drag.over))
                        setDrag(null)
                        setArmed(null)
                      }}
                      onDragEnd={() => {
                        setDrag(null)
                        setArmed(null)
                      }}
                      className={cn(
                        'group border-b last:border-0',
                        selected.includes(row.id) && 'bg-muted/40',
                        drag?.from === i && 'opacity-50',
                        dropping &&
                          (drag!.over < drag!.from
                            ? 'shadow-[inset_0_2px_0_var(--primary)]'
                            : 'shadow-[inset_0_-2px_0_var(--primary)]'),
                      )}
                    >
                      {!disabled && (
                        <td className="pl-1.5 align-top">
                          <div className="flex h-11 items-center">
                            {checkbox(selected.includes(row.id), t('selectRow', { n: i + 1 }), () =>
                              toggleOne(row.id),
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-1 align-top">
                        <div className="flex h-11 items-center justify-center text-xs text-muted-foreground tabular-nums">
                          {!disabled ? (
                            <>
                              <span className="group-focus-within:hidden group-hover:hidden">
                                {i + 1}
                              </span>
                              <button
                                type="button"
                                aria-label={t('dragRow', { n: i + 1 })}
                                title={t('dragRow', { n: i + 1 })}
                                onPointerDown={() => setArmed(row.id)}
                                onPointerUp={() => !drag && setArmed(null)}
                                className="hidden cursor-grab rounded p-0.5 group-focus-within:flex group-hover:flex hover:bg-muted active:cursor-grabbing [&_svg]:size-3.5"
                              >
                                <GripVertical />
                              </button>
                            </>
                          ) : (
                            i + 1
                          )}
                        </div>
                      </td>
                      {details.length > 0 && (
                        <td className="align-top">
                          <div className="flex h-11 items-center">
                            <button
                              type="button"
                              aria-expanded={expanded}
                              aria-label={t(expanded ? 'hideDetails' : 'showDetails', { n: i + 1 })}
                              onClick={() => toggleOpen(row.id)}
                              className="relative flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
                            >
                              <ChevronRight
                                className={cn('transition-transform', expanded && 'rotate-90')}
                              />
                              {detailError && (
                                <span
                                  aria-hidden
                                  className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-destructive"
                                />
                              )}
                            </button>
                          </div>
                        </td>
                      )}
                      {columns.map((col, j) => (
                        <td
                          key={col.name}
                          data-cell
                          data-row={i}
                          data-col={j}
                          className={cn(
                            'px-1.5 py-1.5 align-top',
                            cellWidth[col.type] ?? 'min-w-36',
                          )}
                        >
                          {control(row, i, col, j, false)}
                        </td>
                      ))}
                      {!disabled && (
                        <td className="px-1 align-top">
                          <div className="flex h-11 items-center">
                            <ItemMenu
                              label={t('rowLabel', { n: i + 1 })}
                              index={i}
                              count={rows.length}
                              canAdd={canAdd}
                              onAction={(a) => act(i, a)}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                    {expanded && (
                      <tr data-row={i} className="border-b bg-muted/20" onKeyDown={rowKeys(i)}>
                        <td colSpan={span} className="p-0">
                          <div
                            className="sticky left-0 grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-3 px-3 py-3"
                            style={width ? { width: width - 2 } : undefined}
                          >
                            {details.map((d) => control(row, i, d, -1, true))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
              {!rows.length && (
                <tr>
                  <td
                    colSpan={span}
                    className="px-3 py-6 text-center text-sm text-muted-foreground"
                  >
                    {canAdd ? t('noRowsHint') : t('noRows')}
                  </td>
                </tr>
              )}
            </tbody>
            {totals && (
              <tfoot>
                <tr className="border-t bg-muted/30 font-medium">
                  {!disabled && <td />}
                  <td className="px-1 py-1.5 text-center text-xs text-muted-foreground">Σ</td>
                  {details.length > 0 && <td />}
                  {columns.map((c) => (
                    <td key={c.name} className="px-3 py-1.5 tabular-nums">
                      {totals.find((t) => t.name === c.name)?.text ?? ''}
                    </td>
                  ))}
                  {!disabled && <td />}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {undo && (
        <UndoBar
          message={undo.message}
          onUndo={() => {
            undo.restore()
            dismiss()
          }}
          onDismiss={dismiss}
        />
      )}

      {!disabled && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {canAdd && (
            <button
              type="button"
              onClick={add}
              className="flex h-7 items-center gap-1 rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
            >
              <Plus /> {field.addLabel ?? t('addRow')}
            </button>
          )}
          <span aria-live="polite" className="text-xs text-muted-foreground">
            {note || (rows.length > 0 && !compact ? t('pasteTip') : '')}
          </span>
        </div>
      )}
    </div>
  )
}
