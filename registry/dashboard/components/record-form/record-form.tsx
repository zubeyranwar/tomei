'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'
import { Field, Input } from '@/registry/dashboard/components/input/input'

import { DateField, MultiSelectField, RadioField, SelectField, ToggleField } from './controls'
import {
  isEmptyValue,
  isRequired,
  isVisible,
  type CustomFieldType,
  type FieldDef,
  type FieldValue,
  type FormSection,
  type FormValues,
} from './schema'

export {
  evaluate,
  formatValue,
  isEmptyValue,
  isRequired,
  isVisible,
  validateField,
  validateRecord,
  visibleFields,
} from './schema'
export type {
  BuiltInFieldType,
  Condition,
  CustomFieldType,
  FieldDef,
  FieldType,
  FieldTypeMap,
  FieldValue,
  FormSection,
  FormValues,
  Rule,
} from './schema'

export type FieldRenderProps = {
  id: string
  field: FieldDef
  value: FieldValue | undefined
  values: FormValues
  invalid: boolean
  describedBy?: string
  onChange: (value: FieldValue) => void
}

export type FieldTypeRenderer = CustomFieldType & {
  render: (props: FieldRenderProps) => React.ReactNode
}

export type FormLayout = 'accordion' | 'tabs' | 'cards'

type RecordFormProps = {
  sections: FormSection[]
  values: FormValues
  onChange: (name: string, value: FieldValue) => void
  errors?: Record<string, string>
  layout?: FormLayout
  sectionColumns?: 1 | 2
  fieldTypes?: Record<string, FieldTypeRenderer>
  searchable?: boolean
  currency?: string
  className?: string
}

const NO_ERRORS: Record<string, string> = {}
const NO_TYPES: Record<string, FieldTypeRenderer> = {}

const gridCols = {
  1: '',
  2: '@sm:grid-cols-2',
  3: '@sm:grid-cols-2 @xl:grid-cols-3',
  4: '@sm:grid-cols-2 @3xl:grid-cols-4',
}

function spanClass(span: FieldDef['span'], columns: number) {
  if (!span || span === 1 || columns === 1) return undefined
  if (span === 'full' || span >= columns) return 'col-span-full'
  if (span === 2) return '@sm:col-span-2'
  return '@sm:col-span-full @3xl:col-span-3'
}

export function RecordForm({
  sections,
  values,
  onChange,
  errors = NO_ERRORS,
  layout = 'accordion',
  sectionColumns = 1,
  fieldTypes = NO_TYPES,
  searchable = true,
  currency = '$',
  className,
}: RecordFormProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(
    () => new Set(sections.filter((s) => s.defaultOpen).map((s) => s.id)),
  )
  const [tab, setTab] = useState(sections[0]?.id)
  const [seenErrors, setSeenErrors] = useState(errors)
  const q = query.trim().toLowerCase()

  const toggle = (id: string) => {
    const next = new Set(open)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setOpen(next)
  }

  const shownSections = sections
    .filter((s) => isVisible(s, values))
    .map((s) => ({ ...s, fields: s.fields.filter((f) => isVisible(f, values)) }))
    .filter((s) => s.fields.length)

  if (seenErrors !== errors) {
    setSeenErrors(errors)
    const failing = shownSections.filter((s) => s.fields.some((f) => errors[f.name]))
    if (layout === 'tabs' && failing.length && !failing.some((s) => s.id === tab))
      setTab(failing[0].id)
    if (layout === 'accordion' && failing.length)
      setOpen(new Set([...open, ...failing.map((s) => s.id)]))
  }

  const searched = shownSections
    .map((s) => ({ ...s, fields: s.fields.filter((f) => f.label.toLowerCase().includes(q)) }))
    .filter((s) => s.fields.length)

  const stats = (section: FormSection) => {
    const all = shownSections.find((s) => s.id === section.id)?.fields ?? []
    const empty = (f: FieldDef) =>
      fieldTypes[f.type]?.isEmpty?.(values[f.name]) ?? isEmptyValue(values[f.name])
    return {
      filled: all.filter((f) => !empty(f)).length,
      total: all.length,
      hasError: all.some((f) => errors[f.name]),
    }
  }

  const control = (field: FieldDef) => {
    const id = `field-${field.name}`
    const value = values[field.name]
    const text = typeof value === 'string' ? value : typeof value === 'number' ? String(value) : ''
    const set = (v: FieldValue) => onChange(field.name, v)
    const invalid = !!errors[field.name]
    const describedBy = invalid ? `${id}-error` : field.hint ? `${id}-hint` : undefined
    const custom = fieldTypes[field.type]

    if (custom) {
      return custom.render({ id, field, value, values, invalid, describedBy, onChange: set })
    }

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            value={text}
            readOnly={field.readOnly}
            placeholder={field.placeholder}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            onChange={(e) => set(e.target.value)}
            className="min-h-20 w-full rounded-lg border border-input bg-card px-2.5 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus:border-ring aria-invalid:border-destructive"
          />
        )
      case 'select':
        return (
          <SelectField
            id={id}
            value={text}
            options={field.options ?? []}
            placeholder={field.placeholder}
            onChange={set}
          />
        )
      case 'multiselect':
        return (
          <MultiSelectField
            id={id}
            value={Array.isArray(value) ? value : []}
            options={field.options ?? []}
            creatable={field.creatable}
            placeholder={field.placeholder}
            onChange={set}
          />
        )
      case 'toggle':
        return (
          <ToggleField id={id} value={value === true} label={field.placeholder} onChange={set} />
        )
      case 'radio':
        return <RadioField id={id} value={text} options={field.options ?? []} onChange={set} />
      case 'date':
        return <DateField id={id} value={text} placeholder={field.placeholder} onChange={set} />
      default:
        return (
          <Input
            id={id}
            value={text}
            readOnly={field.readOnly}
            placeholder={field.placeholder}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
            inputMode={
              field.type === 'number' || field.type === 'currency'
                ? 'decimal'
                : field.type === 'url'
                  ? 'url'
                  : undefined
            }
            leading={field.type === 'currency' ? currency : undefined}
            onChange={(e) => set(e.target.value)}
          />
        )
    }
  }

  const hint = (field: FieldDef) => {
    const counted =
      field.maxLength !== undefined && (field.type === 'text' || field.type === 'textarea')
    if (!counted) return field.hint
    const length = String(values[field.name] ?? '').length
    const count = (
      <span className={cn('tabular-nums', length > field.maxLength! && 'text-destructive')}>
        {length}/{field.maxLength}
      </span>
    )
    return field.hint ? (
      <span className="flex justify-between gap-3">
        <span>{field.hint}</span>
        {count}
      </span>
    ) : (
      <span className="flex justify-end">{count}</span>
    )
  }

  const fields = (section: FormSection, framed = true) => {
    const columns = section.columns ?? 1
    return (
      <div
        className={cn(
          'grid gap-4',
          gridCols[columns],
          framed && 'rounded-xl bg-card p-3 shadow-(--shadow-card)',
        )}
      >
        {section.fields.map((field) => (
          <Field
            key={field.name}
            label={field.label}
            htmlFor={`field-${field.name}`}
            hint={hint(field)}
            error={errors[field.name]}
            required={isRequired(field, values)}
            className={spanClass(field.span, columns)}
          >
            {control(field)}
          </Field>
        ))}
      </div>
    )
  }

  const count = (section: FormSection) => {
    const s = stats(section)
    return (
      <span
        className={cn(
          'text-xs font-normal tabular-nums',
          s.hasError ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {s.hasError ? 'Needs attention' : `${s.filled}/${s.total}`}
      </span>
    )
  }

  const card = (section: FormSection) => (
    <section
      key={section.id}
      className={cn(
        'flex flex-col gap-3',
        sectionColumns === 2 && section.span === 'full' && 'col-span-full',
      )}
    >
      <div className="flex items-start gap-2.5 text-[15px] font-medium [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:text-muted-foreground">
        {section.icon}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3>{section.title}</h3>
          {section.description && (
            <p className="text-sm font-normal text-muted-foreground">{section.description}</p>
          )}
        </div>
        {count(section)}
      </div>
      {fields(section)}
    </section>
  )

  const cards = (list: FormSection[]) => (
    <div className={cn('grid gap-6', sectionColumns === 2 && '@3xl:grid-cols-2')}>
      {list.map(card)}
    </div>
  )

  const accordion = (list: FormSection[]) =>
    list.map((section) => {
      const expanded = q ? true : open.has(section.id)
      return (
        <section key={section.id} className="border-b py-1 last:border-0">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => toggle(section.id)}
            className="flex h-11 w-full items-center gap-2.5 text-left text-[15px] font-medium text-muted-foreground hover:text-foreground aria-expanded:text-foreground [&_svg]:size-4"
          >
            {section.icon}
            <span className="flex-1">{section.title}</span>
            {count(section)}
            <span
              aria-hidden
              className={cn('text-[10px] transition-transform', expanded && 'rotate-180')}
            >
              ▾
            </span>
          </button>
          {expanded && (
            <div className="mb-3 flex flex-col gap-3">
              {section.description && (
                <p className="text-sm text-muted-foreground">{section.description}</p>
              )}
              {fields(section)}
            </div>
          )}
        </section>
      )
    })

  const tabs = () => {
    const current = shownSections.find((s) => s.id === tab) ?? shownSections[0]
    if (!current) return null
    return (
      <div className="flex flex-col gap-4">
        <div
          role="tablist"
          aria-label="Sections"
          className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1"
        >
          {shownSections.map((section) => {
            const s = stats(section)
            const active = section.id === current.id
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                id={`tab-${section.id}`}
                aria-selected={active}
                aria-controls={`panel-${section.id}`}
                onClick={() => setTab(section.id)}
                className={cn(
                  'flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors [&_svg]:size-3.5',
                  active
                    ? 'bg-card text-foreground shadow-(--shadow-button)'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {section.icon}
                {section.title}
                {s.hasError && (
                  <span
                    aria-label="Needs attention"
                    className="size-1.5 rounded-full bg-destructive"
                  />
                )}
              </button>
            )
          })}
        </div>
        <div role="tabpanel" id={`panel-${current.id}`} aria-labelledby={`tab-${current.id}`}>
          {current.description && (
            <p className="mb-3 text-sm text-muted-foreground">{current.description}</p>
          )}
          {fields(current)}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('@container flex flex-col', className)}>
      {searchable && (
        <div className="mb-3 flex h-8 items-center gap-2 rounded-lg border border-input bg-card px-2.5 focus-within:border-ring">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
            placeholder="Search fields"
            aria-label="Search fields"
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
      )}
      {q
        ? layout === 'accordion'
          ? accordion(searched)
          : cards(searched)
        : layout === 'tabs'
          ? tabs()
          : layout === 'cards'
            ? cards(shownSections)
            : accordion(shownSections)}
      {q && !searched.length && (
        <p className="py-6 text-center text-sm text-muted-foreground">No fields match “{query}”</p>
      )}
    </div>
  )
}
