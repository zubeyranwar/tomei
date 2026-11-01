import {
  diffValues,
  type Change,
  type FieldTypeMap,
  type FormSection,
  type FormValues,
} from '@/registry/dashboard/components/record-form/schema'

import type { EditItem } from './line-item-editor'

export function diffRecord(
  sections: FormSection[],
  before: { values: FormValues; items: EditItem[] },
  after: { values: FormValues; items: EditItem[] },
  fieldTypes: FieldTypeMap = {},
): Change[] {
  const changes = diffValues(sections, before.values, after.values, fieldTypes)

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
