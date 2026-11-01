import {
  formatValue,
  visibleFields,
  type FieldTypeMap,
  type FormSection,
  type FormValues,
} from '@/registry/dashboard/components/record-form/schema'

import type { EditItem } from './line-item-editor'

export type Change = { id: string; label: string; from: string; to: string }

export function diffRecord(
  sections: FormSection[],
  before: { values: FormValues; items: EditItem[] },
  after: { values: FormValues; items: EditItem[] },
  fieldTypes: FieldTypeMap = {},
): Change[] {
  const changes: Change[] = []

  const shown = new Set(visibleFields(sections, after.values).map((f) => f.name))
  for (const field of sections.flatMap((s) => s.fields)) {
    if (!shown.has(field.name)) continue
    const a = formatValue(field, before.values[field.name], fieldTypes)
    const b = formatValue(field, after.values[field.name], fieldTypes)
    if (a !== b) changes.push({ id: field.name, label: field.label, from: a, to: b })
  }

  for (const item of after.items) {
    const old = before.items.find((i) => i.id === item.id)
    const name = item.name || 'Custom item'
    if (!old)
      changes.push({
        id: item.id,
        label: name,
        from: 'Not on order',
        to: `Added × ${item.quantity}`,
      })
    else {
      if (old.quantity !== item.quantity)
        changes.push({
          id: `${item.id}-qty`,
          label: `${name} quantity`,
          from: `${old.quantity}`,
          to: `${item.quantity}`,
        })
      if (old.price !== item.price)
        changes.push({
          id: `${item.id}-price`,
          label: `${name} price`,
          from: old.price.toFixed(2),
          to: item.price.toFixed(2),
        })
    }
  }
  for (const old of before.items) {
    if (!after.items.some((i) => i.id === old.id))
      changes.push({ id: old.id, label: old.name, from: `× ${old.quantity}`, to: 'Removed' })
  }

  return changes
}

export function ChangeList({ changes }: { changes: Change[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        Unsaved changes
        <span className="rounded-full bg-muted px-2 text-xs font-medium tabular-nums">
          {changes.length}
        </span>
      </h2>
      <ul className="divide-y rounded-xl bg-card px-4 shadow-(--shadow-card)">
        {changes.map((c) => (
          <li
            key={c.id}
            className="grid grid-cols-[minmax(0,10rem)_1fr] items-baseline gap-4 py-2.5 text-sm"
          >
            <span className="truncate text-muted-foreground">{c.label}</span>
            <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
              <span className="text-muted-foreground line-through">{c.from}</span>
              <span aria-hidden className="text-muted-foreground">
                →
              </span>
              <span className="font-medium">{c.to}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
