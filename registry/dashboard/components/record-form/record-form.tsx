'use client'

import { useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { Field } from '@/registry/dashboard/components/input/input'

import {
  ConfigProvider,
  useFormConfig,
  useResolvedConfig,
  type RecordFormSettings,
} from './context'
import { DraftBanner, SaveStatus, type AutosaveState, type DraftState } from './drafts'
import { FieldControl, type FieldTypeRenderer } from './field-control'
import {
  formatValue,
  isEmptyValue,
  isReadOnly,
  isRequired,
  isVisible,
  canEdit,
  validateFields,
  type FieldDef,
  type FieldValue,
  type FormErrors,
  type FormSection,
  type FormValues,
} from './schema'

export {
  applyComputed,
  diffValues,
  evaluate,
  formatValue,
  isEmptyValue,
  isReadOnly,
  isRequired,
  isVisible,
  normalizeOptions,
  optionLabel,
  validateField,
  validateFields,
  validateRecord,
  visibleFields,
} from './schema'
export type {
  BuiltInFieldType,
  Change,
  Condition,
  CustomFieldType,
  FieldDef,
  FieldType,
  FieldTypeMap,
  FieldValue,
  FileItem,
  FormErrors,
  FormSection,
  FormValues,
  Option,
  OptionObject,
  Row,
  Rule,
} from './schema'
export { FieldControl } from './field-control'
export { ChangeList } from './changes'
export { FORM_ERROR, issuesToErrors, standardSchema } from './standard-schema'
export type { Resolver, StandardSchema } from './standard-schema'
export { useRecordForm } from './use-record-form'
export { RecordFormProvider, useFormConfig } from './context'
export type { RecordFormSettings } from './context'
export { createT, en } from './i18n'
export type { Messages, Translate } from './i18n'
export { useNativeDropzone, xhrUploader } from './upload'
export type { DropzoneHook, Uploader, UploadContext, UploadResult } from './upload'
export { DraftBanner, SaveStatus, useLeaveWarning } from './drafts'
export { canEdit, canView } from './schema'
export type { Permissions } from './schema'
export type { ValidateOn } from './use-record-form'
export type { FieldRenderProps, FieldTypeRenderer } from './field-control'

export type FormLayout = 'accordion' | 'tabs' | 'cards' | 'steps'

type RecordFormProps = {
  sections: FormSection[]
  values: FormValues
  onChange: (name: string, value: FieldValue) => void
  onBlurField?: (name: string) => void
  errors?: FormErrors
  layout?: FormLayout
  mode?: 'edit' | 'view'
  readOnly?: boolean
  sectionColumns?: 1 | 2
  fieldTypes?: Record<string, FieldTypeRenderer>
  searchable?: boolean
  currency?: string
  review?: boolean
  submitLabel?: string
  submitting?: boolean
  onSubmit?: () => void
  validateStep?: (names: string[]) => boolean | Promise<boolean>
  draft?: DraftState | null
  autosave?: AutosaveState
  className?: string
} & RecordFormSettings

const NO_ERRORS: FormErrors = {}
const NO_TYPES: Record<string, FieldTypeRenderer> = {}

const gridCols = {
  1: '',
  2: '@sm:grid-cols-2',
  3: '@sm:grid-cols-2 @xl:grid-cols-3',
  4: '@sm:grid-cols-2 @3xl:grid-cols-4',
}

const wide = new Set(['rows', 'group', 'file', 'richtext', 'signature'])

function spanClass(field: FieldDef, columns: number) {
  const span = wide.has(field.type) ? (field.span ?? 'full') : field.span
  if (!span || span === 1 || columns === 1) return undefined
  if (span === 'full' || span >= columns) return 'col-span-full'
  if (span === 2) return '@sm:col-span-2'
  return '@sm:col-span-full @3xl:col-span-3'
}

const button =
  'inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors disabled:opacity-50'

const touches = (key: string, name: string) => key === name || key.startsWith(`${name}.`)

export function RecordForm({
  sections,
  values,
  onChange,
  onBlurField,
  errors: outerErrors = NO_ERRORS,
  layout = 'accordion',
  mode = 'edit',
  readOnly = false,
  sectionColumns = 1,
  fieldTypes = NO_TYPES,
  searchable = layout !== 'steps',
  currency = '$',
  review = true,
  submitLabel,
  submitting = false,
  onSubmit,
  validateStep,
  draft,
  autosave,
  className,
  locale: localeProp,
  messages,
  translate,
  roles: rolesProp,
  upload,
  dropzone,
}: RecordFormProps) {
  const parent = useFormConfig()
  const config = useResolvedConfig(
    { locale: localeProp, messages, translate, roles: rolesProp, upload, dropzone },
    parent,
  )
  const { t, roles, locale } = config
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(
    () => new Set(sections.filter((s) => s.defaultOpen).map((s) => s.id)),
  )
  const [tab, setTab] = useState(sections[0]?.id)
  const [step, setStep] = useState(0)
  const [reached, setReached] = useState(0)
  const [localErrors, setLocalErrors] = useState<FormErrors>({})
  const [checking, setChecking] = useState(false)
  const [editing, setEditing] = useState<{ name: string; before: FieldValue | undefined } | null>(
    null,
  )
  const [seenErrors, setSeenErrors] = useState(outerErrors)
  const focusedFor = useRef<string | null>(null)
  const errors = { ...localErrors, ...outerErrors }
  const q = query.trim().toLowerCase()

  const shownSections = sections
    .filter((s) => isVisible(s, values, roles))
    .map((s) => ({
      ...s,
      fields: s.fields
        .filter((f) => isVisible(f, values, roles))
        .map((f) => (canEdit(s, roles) ? f : { ...f, readOnly: true })),
    }))
    .filter((s) => s.fields.length)

  if (seenErrors !== outerErrors) {
    setSeenErrors(outerErrors)
    const failing = shownSections.filter((s) =>
      s.fields.some((f) =>
        Object.keys(outerErrors).some((k) => outerErrors[k] && touches(k, f.name)),
      ),
    )
    if (failing.length) {
      if (layout === 'tabs' && !failing.some((s) => s.id === tab)) setTab(failing[0].id)
      if (layout === 'accordion') setOpen(new Set([...open, ...failing.map((s) => s.id)]))
      if (layout === 'steps') {
        const first = shownSections.indexOf(failing[0])
        if (first < step) setStep(first)
      }
    }
  }

  const searched = shownSections
    .map((s) => ({ ...s, fields: s.fields.filter((f) => f.label.toLowerCase().includes(q)) }))
    .filter((s) => s.fields.length)

  const valueOf = (field: FieldDef) => (field.compute ? field.compute(values) : values[field.name])

  const errorIn = (field: FieldDef) =>
    Object.keys(errors).some((k) => errors[k] && touches(k, field.name))

  const stats = (section: FormSection) => {
    const all = shownSections.find((s) => s.id === section.id)?.fields ?? []
    const empty = (f: FieldDef) =>
      fieldTypes[f.type]?.isEmpty?.(valueOf(f)) ?? isEmptyValue(valueOf(f))
    return {
      filled: all.filter((f) => !empty(f)).length,
      total: all.length,
      hasError: all.some(errorIn),
    }
  }

  const change = (name: string, value: FieldValue) => {
    const stale = Object.keys(localErrors).filter((k) => touches(k, name))
    if (stale.length) {
      const next = { ...localErrors }
      for (const k of stale) delete next[k]
      setLocalErrors(next)
    }
    onChange(name, value)
  }

  const hint = (field: FieldDef) => {
    const base = field.hint ?? (field.compute ? t('calculated') : undefined)
    const counted =
      field.maxLength !== undefined && (field.type === 'text' || field.type === 'textarea')
    if (!counted) return base
    const length = String(values[field.name] ?? '').length
    return (
      <span className="flex justify-between gap-3">
        <span>{base}</span>
        <span className={cn('tabular-nums', length > field.maxLength! && 'text-destructive')}>
          {length}/{field.maxLength}
        </span>
      </span>
    )
  }

  const control = (field: FieldDef) => {
    const id = `field-${field.name}`
    const invalid = !!errors[field.name]
    return (
      <FieldControl
        id={id}
        field={field}
        value={valueOf(field)}
        values={values}
        invalid={invalid}
        disabled={readOnly || isReadOnly(field, values, roles)}
        describedBy={invalid ? `${id}-error` : field.hint ? `${id}-hint` : undefined}
        currency={currency}
        errors={errors}
        fieldTypes={fieldTypes}
        onChange={(v) => change(field.name, v)}
      />
    )
  }

  const blurWrap = (field: FieldDef, node: React.ReactNode) =>
    onBlurField ? (
      <div
        className="contents"
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onBlurField(field.name)
        }}
      >
        {node}
      </div>
    ) : (
      node
    )

  const viewField = (field: FieldDef, columns: number) => {
    const locked = readOnly || isReadOnly(field, values, roles)
    const isEditing = editing?.name === field.name
    const rich = wide.has(field.type)
    const value = valueOf(field)
    const formatted = formatValue(field, value, fieldTypes, { t, locale })
    const text =
      field.type === 'currency' && formatted !== '—' ? `${currency}${formatted}` : formatted
    const error = errors[field.name]

    const finish = (cancel: boolean) => {
      if (cancel && editing) onChange(field.name, editing.before as FieldValue)
      focusedFor.current = null
      setEditing(null)
      if (!cancel) onBlurField?.(field.name)
    }

    return (
      <div
        key={field.name}
        className={cn('flex min-w-0 flex-col gap-1', spanClass(field, columns))}
      >
        <span id={`field-${field.name}-label`} className="text-xs text-muted-foreground">
          {field.label}
          {isEditing && isRequired(field, values) && <span> *</span>}
        </span>
        {isEditing ? (
          <div
            className="flex flex-col gap-2"
            ref={(el) => {
              if (!el || focusedFor.current === field.name) return
              focusedFor.current = field.name
              const target = el.querySelector<HTMLElement>(
                'input:not([type=file]), textarea, button',
              )
              target?.focus()
              if (target instanceof HTMLInputElement) target.select()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation()
                finish(true)
              }
              if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') finish(false)
            }}
          >
            {control(field)}
            {error && <span className="text-xs text-destructive">{error}</span>}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => finish(false)}
                className={cn(button, 'h-7 bg-primary px-2.5 text-xs text-primary-foreground')}
              >
                {t('done')}
              </button>
              <button
                type="button"
                onClick={() => finish(true)}
                className={cn(button, 'h-7 px-2.5 text-xs text-muted-foreground hover:bg-muted')}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        ) : rich ? (
          <div className="flex flex-col items-start gap-1.5">
            {isEmptyValue(value) ? (
              <span className="text-sm text-muted-foreground">—</span>
            ) : (
              <div className="w-full">
                <FieldControl
                  id={`field-${field.name}`}
                  field={field}
                  value={value}
                  values={values}
                  invalid={false}
                  disabled
                  currency={currency}
                  fieldTypes={fieldTypes}
                  onChange={() => {}}
                />
              </div>
            )}
            {!locked && (
              <button
                type="button"
                onClick={() => setEditing({ name: field.name, before: values[field.name] })}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                {t('editField', { label: field.label.toLowerCase() })}
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            disabled={locked}
            aria-labelledby={`field-${field.name}-label`}
            title={locked ? undefined : t('clickToEdit')}
            onClick={() => setEditing({ name: field.name, before: values[field.name] })}
            className={cn(
              'group -mx-1.5 flex min-h-7 items-center justify-between gap-2 rounded-md px-1.5 text-left text-sm transition-colors',
              !locked && 'hover:bg-muted',
              error && 'ring-1 ring-destructive',
              text === '—' && 'text-muted-foreground',
            )}
          >
            <span className="min-w-0 break-words whitespace-pre-wrap">{text}</span>
            {!locked && (
              <span
                aria-hidden
                className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                ✎
              </span>
            )}
          </button>
        )}
        {!isEditing && error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    )
  }

  const fields = (section: FormSection) => {
    const columns = section.columns ?? 1
    return (
      <div className="@container rounded-xl bg-card p-3 shadow-(--shadow-card)">
        <div className={cn('grid gap-4 [&>*]:min-w-0', gridCols[columns])}>
          {section.fields.map((field) =>
            mode === 'view' ? (
              viewField(field, columns)
            ) : (
              <Field
                key={field.name}
                label={field.label}
                htmlFor={`field-${field.name}`}
                hint={hint(field)}
                error={errors[field.name]}
                required={!readOnly && isRequired(field, values)}
                className={spanClass(field, columns)}
              >
                {blurWrap(field, control(field))}
              </Field>
            ),
          )}
        </div>
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
        {s.hasError ? t('needsAttention') : `${s.filled}/${s.total}`}
      </span>
    )
  }

  const heading = (section: FormSection, extra?: React.ReactNode) => (
    <div className="flex items-start gap-2.5 text-[15px] font-medium [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:text-muted-foreground">
      {section.icon}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3>{section.title}</h3>
        {section.description && (
          <p className="text-sm font-normal text-muted-foreground">{section.description}</p>
        )}
      </div>
      {extra ?? count(section)}
    </div>
  )

  const cards = (list: FormSection[]) => (
    <div className={cn('grid gap-6 [&>*]:min-w-0', sectionColumns === 2 && '@3xl:grid-cols-2')}>
      {list.map((section) => (
        <section
          key={section.id}
          className={cn(
            'flex flex-col gap-3',
            sectionColumns === 2 && section.span === 'full' && 'col-span-full',
          )}
        >
          {heading(section)}
          {fields(section)}
        </section>
      ))}
    </div>
  )

  const toggle = (id: string) => {
    const next = new Set(open)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setOpen(next)
  }

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
          {shownSections.map((section) => (
            <button
              key={section.id}
              type="button"
              role="tab"
              id={`tab-${section.id}`}
              aria-selected={section.id === current.id}
              aria-controls={`panel-${section.id}`}
              onClick={() => setTab(section.id)}
              className={cn(
                'flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors [&_svg]:size-3.5',
                section.id === current.id
                  ? 'bg-card text-foreground shadow-(--shadow-button)'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {section.icon}
              {section.title}
              {stats(section).hasError && (
                <span
                  aria-label="Needs attention"
                  className="size-1.5 rounded-full bg-destructive"
                />
              )}
            </button>
          ))}
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

  const steps = () => {
    const last = shownSections.length - 1
    const reviewing = review && step > last
    const current = shownSections[Math.min(step, last)]
    if (!current) return null
    const labels = [...shownSections.map((s) => s.title), ...(review ? [t('review')] : [])]

    const go = (to: number) => {
      setStep(to)
      setReached(Math.max(reached, to))
    }

    const check = async (section: FormSection) => {
      if (validateStep) return validateStep(section.fields.map((f) => f.name))
      const found = validateFields(section.fields, values, fieldTypes, { t, locale, roles })
      if (!Object.keys(found).length) return true
      setLocalErrors((prev) => ({ ...prev, ...found }))
      return false
    }

    const next = async () => {
      setChecking(true)
      const ok = await check(current).finally(() => setChecking(false))
      if (!ok) return
      if (step < last || review) go(step + 1)
      else onSubmit?.()
    }

    const submitAll = async () => {
      setChecking(true)
      try {
        for (let i = 0; i < shownSections.length; i++) {
          if (!(await check(shownSections[i]))) return setStep(i)
        }
      } finally {
        setChecking(false)
      }
      onSubmit?.()
    }

    return (
      <div className="flex flex-col gap-5">
        <ol className="flex items-center gap-2 overflow-x-auto pb-1">
          {labels.map((label, i) => {
            const active = i === step
            const done = i < step
            const hasError = i <= last && stats(shownSections[i]).hasError
            return (
              <li key={label} className="flex shrink-0 items-center gap-2">
                {i > 0 && <span aria-hidden className="h-px w-6 bg-border" />}
                <button
                  type="button"
                  disabled={i > reached}
                  aria-current={active ? 'step' : undefined}
                  onClick={() => setStep(i)}
                  className="flex items-center gap-2 text-sm disabled:cursor-default"
                >
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full border text-xs font-medium tabular-nums',
                      hasError
                        ? 'border-destructive text-destructive'
                        : active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : done
                            ? 'border-foreground/20 bg-muted text-foreground'
                            : 'text-muted-foreground',
                    )}
                  >
                    {done && !hasError ? '✓' : i + 1}
                  </span>
                  <span
                    className={cn(
                      'whitespace-nowrap',
                      active ? 'font-medium text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {label}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>

        {reviewing ? (
          <div className="flex flex-col gap-4">
            {shownSections.map((section, i) => (
              <section key={section.id} className="rounded-xl bg-card p-4 shadow-(--shadow-card)">
                {heading(
                  section,
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    {t('edit')}
                  </button>,
                )}
                <dl className={cn('mt-3 grid gap-x-6 gap-y-3', gridCols[section.columns ?? 2])}>
                  {section.fields.map((f) => (
                    <div
                      key={f.name}
                      className={cn(
                        'flex min-w-0 flex-col gap-0.5',
                        spanClass(f, section.columns ?? 2),
                      )}
                    >
                      <dt className="text-xs text-muted-foreground">{f.label}</dt>
                      <dd className="text-sm break-words">
                        {formatValue(f, valueOf(f), fieldTypes, { t, locale })}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        ) : (
          <section className="flex flex-col gap-3">
            {heading(current, <span />)}
            {fields(current)}
          </section>
        )}

        <div className="flex items-center justify-between gap-2 border-t pt-4">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            className={cn(button, 'text-muted-foreground hover:bg-muted disabled:invisible')}
          >
            {t('back')}
          </button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {t('stepOf', { step: step + 1, total: labels.length })}
          </span>
          <button
            type="button"
            disabled={submitting || checking}
            aria-busy={checking || undefined}
            onClick={() => void (reviewing ? submitAll() : next())}
            className={cn(button, 'bg-primary text-primary-foreground hover:bg-primary/90')}
          >
            {reviewing || (!review && step === last)
              ? submitting
                ? t('saving')
                : (submitLabel ?? t('submit'))
              : checking
                ? t('checking')
                : step === last
                  ? t('review')
                  : t('next')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <ConfigProvider value={config}>
      <div className={cn('@container flex flex-col', className)}>
        {draft && <DraftBanner draft={draft} />}
        {autosave && autosave.status !== 'idle' && (
          <div className="mb-2 flex justify-end">
            <SaveStatus state={autosave} />
          </div>
        )}
        {searchable && (
          <div className="mb-3 flex h-8 items-center gap-2 rounded-lg border border-input bg-card px-2.5 focus-within:border-ring">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
              placeholder={t('searchFields')}
              aria-label={t('searchFields')}
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                aria-label={t('clearSearch')}
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
          : layout === 'steps'
            ? steps()
            : layout === 'tabs'
              ? tabs()
              : layout === 'cards'
                ? cards(shownSections)
                : accordion(shownSections)}
        {q && !searched.length && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('noFieldsMatch', { query })}
          </p>
        )}
      </div>
    </ConfigProvider>
  )
}
