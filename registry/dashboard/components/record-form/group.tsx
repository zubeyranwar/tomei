'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Field } from '@/registry/dashboard/components/input/input'

import { useFormConfig } from './context'
import { applyAction, ItemMenu, newItem, UndoBar, useUndo, type ItemAction } from './items'
import { hasErrorUnder, type NestedProps } from './rows'
import {
  formatValue,
  isReadOnly,
  isRequired,
  isVisible,
  scope,
  type FieldDef,
  type FieldValue,
  type Row,
} from './schema'

const gridCols = {
  1: '',
  2: '@sm:grid-cols-2',
  3: '@sm:grid-cols-2 @xl:grid-cols-3',
}

const wideTypes = new Set(['rows', 'group', 'textarea', 'richtext', 'signature', 'file'])

export function GroupField({ Control, ...props }: NestedProps) {
  const {
    id,
    field,
    value,
    values,
    disabled,
    describedBy,
    onChange,
    currency,
    errors = {},
    fieldTypes,
    path = field.name,
  } = props
  const fields = field.fields ?? []
  const items = Array.isArray(value) ? (value as Row[]) : []
  const { t, roles, locale } = useFormConfig()
  const noun = field.itemLabel ?? t('noun.item_one').replace(/^./, (c) => c.toUpperCase())
  const nounPlural = (field.itemLabelPlural ?? `${noun}s`).toLowerCase()
  const canAdd = !disabled && (field.maxLength === undefined || items.length < field.maxLength)
  const [collapsed, setCollapsed] = useState<string[]>([])
  const wrap = useRef<HTMLDivElement>(null)
  const pendingFocus = useRef<number | null>(null)
  const { undo, offer, dismiss } = useUndo()

  useEffect(() => {
    const index = pendingFocus.current
    if (index === null) return
    pendingFocus.current = null
    wrap.current
      ?.querySelector<HTMLElement>(
        `[data-item="${index}"] [data-body] :is(input:not([type=file]), textarea, button, [role=combobox])`,
      )
      ?.focus()
  }, [value])

  const blank = () => newItem(fields)
  const setValue = (i: number, name: string, v: FieldValue) =>
    onChange(items.map((item, j) => (j === i ? { ...item, [name]: v } : item)))

  const act = (i: number, action: ItemAction) => {
    if (action === 'delete') {
      const before = items
      onChange(items.filter((_, j) => j !== i))
      return offer(t('itemDeleted', { label: noun, n: i + 1 }), () => onChange(before))
    }
    const result = applyAction(items, i, action, blank)
    pendingFocus.current = result.focus
    onChange(result.list)
    if (action === 'up' || action === 'down') return
    setCollapsed((c) => c.filter((x) => x !== result.list[result.focus].id))
  }

  const title = (item: Row, i: number) => {
    const titleField = fields.find((f) => f.name === field.titleField)
    const text = titleField
      ? formatValue(titleField, item[titleField.name], fieldTypes, { t, locale })
      : t('empty')
    return text !== t('empty') ? text : `${noun} ${i + 1}`
  }

  const subtitle = (item: Row) =>
    fields
      .filter(
        (f) => f.name !== field.titleField && !wideTypes.has(f.type) && f.type !== 'signature',
      )
      .map((f) =>
        formatValue(f, f.compute ? f.compute(scope(values, item)) : item[f.name], fieldTypes, {
          t,
          locale,
        }),
      )
      .filter((text) => text !== t('empty'))
      .slice(0, 3)
      .join(' · ')

  const body = (item: Row, i: number) => {
    const ctx = scope(values, item)
    const columns = field.groupColumns ?? 2
    return (
      <div data-body className="@container">
        <div className={cn('grid gap-4 [&>*]:min-w-0', gridCols[columns])}>
          {fields.map((f: FieldDef) => {
            if (!isVisible(f, ctx, roles)) return null
            const key = `${path}.${i}.${f.name}`
            const error = errors[key]
            return (
              <Field
                key={f.name}
                label={f.label}
                htmlFor={`field-${key}`}
                hint={f.hint ?? (f.compute ? t('calculated') : undefined)}
                error={error}
                required={!disabled && isRequired(f, ctx)}
                className={cn(wideTypes.has(f.type) && 'col-span-full')}
              >
                <Control
                  id={`field-${key}`}
                  path={key}
                  field={f}
                  value={f.compute ? f.compute(ctx) : item[f.name]}
                  values={ctx}
                  invalid={!!error}
                  disabled={!!disabled || isReadOnly(f, ctx, roles)}
                  describedBy={
                    error ? `field-${key}-error` : f.hint ? `field-${key}-hint` : undefined
                  }
                  currency={currency}
                  errors={errors}
                  fieldTypes={fieldTypes}
                  onChange={(v) => setValue(i, f.name, v)}
                />
              </Field>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div ref={wrap} id={id} aria-describedby={describedBy} className="flex min-w-0 flex-col gap-2">
      {items.map((item, i) => {
        const failing = hasErrorUnder(errors, `${path}.${i}`)
        const open = !collapsed.includes(item.id) || failing
        return (
          <section
            key={item.id}
            data-item={i}
            className={cn(
              'rounded-xl border bg-card transition-colors',
              failing ? 'border-destructive/60' : 'border-border',
            )}
            onKeyDown={(e) => {
              if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return
              e.preventDefault()
              e.stopPropagation()
              act(i, e.key === 'ArrowUp' ? 'up' : 'down')
            }}
          >
            <header className="flex items-center gap-2 px-3 py-2">
              <button
                type="button"
                aria-expanded={open}
                onClick={() =>
                  setCollapsed((c) =>
                    c.includes(item.id) ? c.filter((x) => x !== item.id) : [...c, item.id],
                  )
                }
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <ChevronDown
                  className={cn(
                    'size-4 shrink-0 text-muted-foreground transition-transform',
                    !open && '-rotate-90',
                  )}
                />
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium tabular-nums">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{title(item, i)}</span>
                  {!open && subtitle(item) && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {subtitle(item)}
                    </span>
                  )}
                </span>
                {failing && (
                  <span className="shrink-0 text-xs text-destructive">{t('needsAttention')}</span>
                )}
              </button>
              {!disabled && (
                <ItemMenu
                  label={title(item, i)}
                  index={i}
                  count={items.length}
                  canAdd={canAdd}
                  onAction={(a) => act(i, a)}
                />
              )}
            </header>
            {open && <div className="border-t px-3 py-3">{body(item, i)}</div>}
          </section>
        )
      })}

      {!items.length && (
        <div className="rounded-xl border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
          {t('noItems', { label: nounPlural })}
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

      {canAdd && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              pendingFocus.current = items.length
              onChange([...items, blank()])
            }}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-dashed px-3 text-sm font-medium text-muted-foreground hover:border-ring hover:text-foreground [&_svg]:size-3.5"
          >
            <Plus /> {field.addLabel ?? t('addItem', { label: noun.toLowerCase() })}
          </button>
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => setCollapsed(collapsed.length ? [] : items.map((x) => x.id))}
              className="h-8 rounded-lg px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {collapsed.length ? t('expandAll') : t('collapseAll')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
