import { useFormState, useWatch, type UseFormReturn } from 'react-hook-form'

import { cn } from '@/lib/utils'

import { useFormConfig, useResolvedConfig, type RecordFormSettings } from './context'
import {
  diffValues,
  type Change,
  type FieldTypeMap,
  type FormSection,
  type FormValues,
} from './schema'

export function useFormChanges(
  form: UseFormReturn<FormValues>,
  sections: FormSection[],
  { fieldTypes, ...settings }: { fieldTypes?: FieldTypeMap } & RecordFormSettings = {},
): Change[] {
  const { t, locale, roles } = useResolvedConfig(settings, useFormConfig())
  const values = useWatch({ control: form.control }) as FormValues
  const { defaultValues = {} } = useFormState({ control: form.control })
  return diffValues(sections, defaultValues as FormValues, values, fieldTypes, { t, locale, roles })
}

type ChangeListProps = {
  changes: Change[]
  title?: React.ReactNode
  className?: string
}

export function ChangeList({ changes, title = 'Unsaved changes', className }: ChangeListProps) {
  if (!changes.length) return null
  return (
    <section className={cn('flex flex-col gap-3', className)}>
      <h2 className="flex items-center gap-2 text-base font-semibold">
        {title}
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
