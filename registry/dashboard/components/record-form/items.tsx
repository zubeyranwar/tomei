'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Copy,
  CornerDownLeft,
  CornerUpLeft,
  MoreHorizontal,
  Trash2,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import { toast } from '@/registry/dashboard/components/toast/toast'

import { useFormConfig } from './context'
import { optionRow } from './controls'
import { Popover } from './popover'
import { isNested, type FieldDef, type FieldValue, type Row } from './schema'

export const newId = () => Math.random().toString(36).slice(2, 10)

export function newItem(fields: FieldDef[]): Row {
  const item: Row = { id: newId() }
  for (const f of fields) {
    if (f.compute) continue
    item[f.name] =
      f.type === 'toggle'
        ? false
        : isNested(f) || f.type === 'multiselect' || f.type === 'list' || f.type === 'file'
          ? []
          : ''
  }
  return item
}

export function cloneItem(item: Row): Row {
  const copy = JSON.parse(JSON.stringify(item)) as Row
  const reId = (value: FieldValue | undefined): FieldValue | undefined =>
    Array.isArray(value)
      ? ((value as unknown[]).map((v) =>
          v && typeof v === 'object' && 'id' in (v as object)
            ? Object.fromEntries(
                Object.entries(v as Row).map(([k, inner]) => [
                  k,
                  k === 'id' ? newId() : reId(inner),
                ]),
              )
            : v,
        ) as FieldValue)
      : value
  return Object.fromEntries(
    Object.entries(copy).map(([k, v]) => [k, k === 'id' ? newId() : reId(v)]),
  ) as Row
}

export function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length || from === to) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export type ItemAction = 'above' | 'below' | 'duplicate' | 'up' | 'down' | 'delete'

export function ItemMenu({
  label,
  index,
  count,
  canAdd,
  onAction,
}: {
  label: string
  index: number
  count: number
  canAdd: boolean
  onAction: (action: ItemAction) => void
}) {
  const { t } = useFormConfig()
  const items: {
    action: ItemAction
    text: string
    icon: React.ReactNode
    hidden?: boolean
    danger?: boolean
  }[] = [
    { action: 'above', text: t('insertAbove'), icon: <CornerUpLeft />, hidden: !canAdd },
    { action: 'below', text: t('insertBelow'), icon: <CornerDownLeft />, hidden: !canAdd },
    { action: 'duplicate', text: t('duplicate'), icon: <Copy />, hidden: !canAdd },
    { action: 'up', text: t('moveUp'), icon: <ArrowUp />, hidden: index === 0 },
    { action: 'down', text: t('moveDown'), icon: <ArrowDown />, hidden: index === count - 1 },
    { action: 'delete', text: t('delete'), icon: <Trash2 />, danger: true },
  ]
  return (
    <div className="shrink-0">
      <Popover
        align="end"
        className="w-44"
        trigger={({ open, toggle }) => (
          <button
            type="button"
            aria-label={t('actionsFor', { label })}
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={toggle}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
          >
            <MoreHorizontal />
          </button>
        )}
      >
        {(close) => (
          <ul role="menu">
            {items
              .filter((i) => !i.hidden)
              .map((i) => (
                <li key={i.action}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      close()
                      onAction(i.action)
                    }}
                    className={cn(
                      optionRow,
                      '[&_svg]:size-3.5 [&_svg]:text-muted-foreground',
                      i.danger && 'text-destructive [&_svg]:text-destructive',
                    )}
                  >
                    {i.icon}
                    {i.text}
                  </button>
                </li>
              ))}
          </ul>
        )}
      </Popover>
    </div>
  )
}

export function useUndo() {
  const { t } = useFormConfig()
  const [undo, setUndo] = useState<{ message: string; restore: () => void } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])
  const offer = (message: string, restore: () => void) => {
    if (toast.isMounted()) {
      toast(message, { duration: 6000, action: { label: t('undo'), onClick: restore } })
      return
    }
    if (timer.current) clearTimeout(timer.current)
    setUndo({ message, restore })
    timer.current = setTimeout(() => setUndo(null), 6000)
  }
  const dismiss = () => setUndo(null)
  return { undo, offer, dismiss }
}

export function UndoBar({
  message,
  onUndo,
  onDismiss,
}: {
  message: string
  onUndo: () => void
  onDismiss: () => void
}) {
  const { t } = useFormConfig()
  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 rounded-lg bg-foreground px-3 py-2 text-sm text-background"
    >
      <span>{message}</span>
      <span className="flex items-center gap-1">
        <button
          type="button"
          onClick={onUndo}
          className="rounded px-2 py-0.5 font-medium hover:bg-background/15"
        >
          {t('undo')}
        </button>
        <button
          type="button"
          aria-label={t('dismiss')}
          onClick={onDismiss}
          className="rounded px-1.5 py-0.5 opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      </span>
    </div>
  )
}

export function applyAction(list: Row[], index: number, action: ItemAction, blank: () => Row) {
  switch (action) {
    case 'above':
      return { list: [...list.slice(0, index), blank(), ...list.slice(index)], focus: index }
    case 'below':
      return {
        list: [...list.slice(0, index + 1), blank(), ...list.slice(index + 1)],
        focus: index + 1,
      }
    case 'duplicate':
      return {
        list: [...list.slice(0, index + 1), cloneItem(list[index]), ...list.slice(index + 1)],
        focus: index + 1,
      }
    case 'up':
      return { list: move(list, index, index - 1), focus: index - 1 }
    case 'down':
      return { list: move(list, index, index + 1), focus: index + 1 }
    case 'delete':
      return { list: list.filter((_, i) => i !== index), focus: Math.max(0, index - 1) }
  }
}
