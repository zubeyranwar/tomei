import {
  formatDate,
  formatDateRange,
  formatDateTime,
  formatMonth,
  formatTime,
  thisMonthIso,
  todayIso,
} from './dates'
import { defaultT, type T } from './i18n'

export type BuiltInFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'currency'
  | 'date'
  | 'time'
  | 'month'
  | 'select'
  | 'multiselect'
  | 'toggle'
  | 'radio'
  | 'list'
  | 'file'
  | 'rows'
  | 'lookup'
  | 'address'
  | 'daterange'
  | 'datetime'
  | 'percent'
  | 'duration'
  | 'richtext'
  | 'signature'
  | 'group'

export type FieldType = BuiltInFieldType | (string & {})

export type OptionObject = {
  value: string
  label: string
  description?: string
  avatar?: string
  color?: string
}
export type Option = string | OptionObject

export type FileItem = {
  id: string
  name: string
  size: number
  type: string
  url?: string
  status?: 'uploading' | 'done' | 'error'
  progress?: number
  error?: string
}
export type Row = { id: string; [column: string]: FieldValue | undefined }

export type FieldValue = string | number | boolean | null | string[] | FileItem[] | Row[]
export type FormValues = Record<string, FieldValue | undefined>
export type FormErrors = Record<string, string>

export type Condition =
  | {
      field: string
      is?: FieldValue | FieldValue[]
      not?: FieldValue | FieldValue[]
      filled?: boolean
    }
  | { any: Condition[] }
  | { all: Condition[] }

export type Rule =
  | 'required'
  | 'type'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'maxSize'
  | 'accept'
  | 'sum'

export type FieldDef = {
  name: string
  label: string
  type: FieldType
  required?: boolean
  requiredWhen?: Condition | Condition[]
  visibleWhen?: Condition | Condition[]
  readOnly?: boolean
  readOnlyWhen?: Condition | Condition[]
  compute?: (values: FormValues) => FieldValue
  options?: Option[]
  display?: 'segmented' | 'cards' | 'checkboxes'
  creatable?: boolean
  placeholder?: string
  hint?: string
  span?: 1 | 2 | 3 | 4 | 'full'
  min?: number | string
  max?: number | string
  step?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  accept?: string
  maxSize?: number
  multiple?: boolean
  columns?: FieldDef[]
  details?: FieldDef[]
  fields?: FieldDef[]
  itemLabel?: string
  titleField?: string
  groupColumns?: 1 | 2 | 3
  totals?: string[]
  sum?: { column: string; equals?: number; min?: number; max?: number }
  addLabel?: string
  messages?: Partial<Record<Rule, string>>
  search?: (query: string) => Promise<OptionObject[]>
  decimals?: number
  defaultCountry?: string
  itemLabelPlural?: string
  permissions?: Permissions
  props?: Record<string, unknown>
}

export type Permissions = { view?: string[]; edit?: string[] }

export type Context = { t?: T; locale?: string; roles?: string[] }

export type FormSection = {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  span?: 1 | 'full'
  defaultOpen?: boolean
  visibleWhen?: Condition | Condition[]
  permissions?: Permissions
  fields: FieldDef[]
}

export type CustomFieldType = {
  validate?: (
    value: FieldValue | undefined,
    field: FieldDef,
    values: FormValues,
  ) => string | undefined
  isEmpty?: (value: FieldValue | undefined) => boolean
  format?: (value: FieldValue | undefined, field: FieldDef) => string
}

export type FieldTypeMap = Record<string, CustomFieldType>

export type Change = { id: string; label: string; from: string; to: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_PATTERN = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/

export function normalizeOptions(options: Option[] = []): OptionObject[] {
  return options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
}

const known = new Map<string, OptionObject>()

export function rememberOptions(options: OptionObject[]) {
  for (const o of options) known.set(o.value, o)
}

export function findOption(field: Pick<FieldDef, 'options'>, value: string) {
  return normalizeOptions(field.options).find((o) => o.value === value) ?? known.get(value)
}

export function optionLabel(field: Pick<FieldDef, 'options'>, value: string) {
  return findOption(field, value)?.label ?? value
}

export function plainText(html: string) {
  return html
    .replace(/<(br|\/p|\/li|\/div)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

export function parseDuration(text: string): number | null {
  const t = text.trim().toLowerCase().replace(/\s+/g, '')
  if (!t) return null
  if (/^\d+(\.\d+)?$/.test(t)) return Math.round(Number(t))
  const clock = /^(\d+):([0-5]\d)$/.exec(t)
  if (clock) return Number(clock[1]) * 60 + Number(clock[2])
  const parts = /^(?:(\d+(?:\.\d+)?)d)?(?:(\d+(?:\.\d+)?)h)?(?:(\d+)m(?:in)?)?$/.exec(t)
  if (!parts || !(parts[1] || parts[2] || parts[3])) return null
  return Math.round(
    Number(parts[1] ?? 0) * 1440 + Number(parts[2] ?? 0) * 60 + Number(parts[3] ?? 0),
  )
}

export function showDuration(minutes: number) {
  if (!minutes) return '0m'
  const d = Math.floor(minutes / 1440)
  const h = Math.floor((minutes % 1440) / 60)
  const m = minutes % 60
  return [d && `${d}d`, h && `${h}h`, m && `${m}m`].filter(Boolean).join(' ')
}

export function phoneDigits(value: string) {
  return value.replace(/\D/g, '')
}

export function formatNumber(value: number, decimals?: number, locale?: string) {
  return new Intl.NumberFormat(locale ?? 'en-US', {
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 20,
  }).format(value)
}

const isRichEmpty = (value: FieldValue | undefined) =>
  typeof value === 'string' && !plainText(value) && !/<img/i.test(value)

export function isEmptyValue(value: FieldValue | undefined) {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

const matches = (value: FieldValue | undefined, expected: FieldValue | FieldValue[]) => {
  const wanted = Array.isArray(expected) ? expected : [expected]
  if (Array.isArray(value)) return value.some((v) => wanted.includes(v as never))
  return wanted.some((w) => w === value || (w !== null && String(w) === String(value ?? '')))
}

export function evaluate(
  condition: Condition | Condition[] | undefined,
  values: FormValues,
): boolean {
  if (!condition) return true
  if (Array.isArray(condition)) return condition.every((c) => evaluate(c, values))
  if ('any' in condition) return condition.any.some((c) => evaluate(c, values))
  if ('all' in condition) return condition.all.every((c) => evaluate(c, values))
  const value = values[condition.field]
  if (condition.filled !== undefined && isEmptyValue(value) === condition.filled) return false
  if (condition.is !== undefined && !matches(value, condition.is)) return false
  if (condition.not !== undefined && matches(value, condition.not)) return false
  return true
}

const allowed = (list: string[] | undefined, roles: string[] | undefined) =>
  !list || list.length === 0 || (!!roles && roles.some((r) => list.includes(r)))

export const canView = (item: { permissions?: Permissions }, roles?: string[]) =>
  allowed(item.permissions?.view, roles)

export const canEdit = (item: { permissions?: Permissions }, roles?: string[]) =>
  allowed(item.permissions?.edit, roles)

export const isVisible = (
  item: { visibleWhen?: FieldDef['visibleWhen']; permissions?: Permissions },
  values: FormValues,
  roles?: string[],
) => canView(item, roles) && evaluate(item.visibleWhen, values)

export const isRequired = (field: FieldDef, values: FormValues) =>
  !!field.required || (field.requiredWhen !== undefined && evaluate(field.requiredWhen, values))

export const isReadOnly = (field: FieldDef, values: FormValues, roles?: string[]) =>
  !!field.readOnly ||
  !!field.compute ||
  !canEdit(field, roles) ||
  (field.readOnlyWhen !== undefined && evaluate(field.readOnlyWhen, values))

export function visibleFields(sections: FormSection[], values: FormValues, roles?: string[]) {
  return sections
    .filter((s) => isVisible(s, values, roles))
    .flatMap((s) =>
      canEdit(s, roles) ? s.fields : s.fields.map((f) => ({ ...f, readOnly: true })),
    )
    .filter((f) => isVisible(f, values, roles))
}

export function editableFields(sections: FormSection[], values: FormValues, roles?: string[]) {
  return visibleFields(sections, values, roles).filter(
    (f) => !isReadOnly(f, values, roles) || f.compute,
  )
}

export const itemFields = (field: FieldDef) =>
  field.type === 'group'
    ? (field.fields ?? [])
    : [...(field.columns ?? []), ...(field.details ?? [])]

export const isNested = (field: FieldDef) => field.type === 'rows' || field.type === 'group'

export const scope = (values: FormValues, item: Row): FormValues => ({ ...values, ...item })

export function computeItems(field: FieldDef, items: Row[], values: FormValues): Row[] {
  return items.map((item) => {
    let next = item
    for (const sub of itemFields(field)) {
      if (sub.compute) {
        const v = sub.compute(scope(values, next))
        if (JSON.stringify(v) !== JSON.stringify(next[sub.name])) next = { ...next, [sub.name]: v }
      }
      const nested = next[sub.name]
      if (isNested(sub) && Array.isArray(nested)) {
        const inner = computeItems(sub, nested as Row[], scope(values, next))
        if (JSON.stringify(inner) !== JSON.stringify(nested)) next = { ...next, [sub.name]: inner }
      }
    }
    return next
  })
}

export function applyComputed(sections: FormSection[], values: FormValues): FormValues {
  let next = values
  for (const field of sections.flatMap((s) => s.fields)) {
    if (field.compute) {
      const value = field.compute(next)
      if (JSON.stringify(value) !== JSON.stringify(next[field.name]))
        next = { ...next, [field.name]: value }
    }
    const items = next[field.name]
    if (isNested(field) && Array.isArray(items)) {
      const computed = computeItems(field, items as Row[], next)
      if (JSON.stringify(computed) !== JSON.stringify(items))
        next = { ...next, [field.name]: computed }
    }
  }
  return next
}

const limitOf = (limit: number | string, type: FieldType) =>
  limit === 'today' ? (type === 'month' ? thisMonthIso() : todayIso()) : String(limit)

export function showDate(iso: string, locale?: string) {
  return formatDate(iso, locale)
}
export function showMonth(iso: string, locale?: string) {
  return formatMonth(iso, locale)
}
export function showTime(hhmm: string, locale?: string) {
  return formatTime(hhmm, locale)
}
export function showDateTime(value: string, locale?: string) {
  return formatDateTime(value, locale)
}
export function showSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const showLimit = (limit: string, type: FieldType, locale?: string) =>
  type === 'date'
    ? showDate(limit, locale)
    : type === 'month'
      ? showMonth(limit, locale)
      : type === 'time'
        ? showTime(limit, locale)
        : limit

function acceptsFile(accept: string, file: FileItem) {
  return accept
    .split(',')
    .map((a) => a.trim().toLowerCase())
    .some((a) =>
      a.startsWith('.')
        ? file.name.toLowerCase().endsWith(a)
        : a.endsWith('/*')
          ? file.type.startsWith(a.slice(0, -1))
          : file.type === a,
    )
}

function nounFor(field: FieldDef, count: number, t: T) {
  if (field.type === 'group') {
    const one = (field.itemLabel ?? t('noun.item_one')).toLowerCase()
    return count === 1 ? one : (field.itemLabelPlural ?? `${one}s`).toLowerCase()
  }
  const key =
    field.type === 'rows'
      ? 'noun.row'
      : field.type === 'file'
        ? 'noun.file'
        : field.type === 'list'
          ? 'noun.item'
          : 'noun.option'
  return t(key, { count })
}

export function validateField(
  field: FieldDef,
  value: FieldValue | undefined,
  values: FormValues = {},
  fieldTypes: FieldTypeMap = {},
  context: Context = {},
): string | undefined {
  const t = context.t ?? defaultT
  const { locale } = context
  const say = (rule: Rule, key: string, vars: Record<string, unknown> = {}) => {
    const all = { label: field.label, ...vars }
    const template = field.messages?.[rule]
    if (!template) return t(key, all)
    return template.replace(/\{(\w+)\}/g, (_, k: string) =>
      String(all[k as keyof typeof all] ?? field[k as keyof FieldDef] ?? ''),
    )
  }
  const count = (rule: Rule, key: 'minCount' | 'maxCount', n: number) =>
    say(rule, key, { count: n, noun: nounFor(field, n, t), min: n, max: n })

  const custom = fieldTypes[field.type]
  const empty = custom?.isEmpty
    ? custom.isEmpty(value)
    : isEmptyValue(value) ||
      (field.type === 'richtext' && isRichEmpty(value)) ||
      (field.type === 'daterange' && value === '/')

  if (empty && (field.type === 'rows' || field.type === 'group') && (field.minLength ?? 0) > 0)
    return count('minLength', 'minCount', field.minLength!)
  if (empty) return isRequired(field, values) ? say('required', 'required') : undefined
  if (custom?.validate) {
    const error = custom.validate(value, field, values)
    if (error) return error
  }

  const { min, max, minLength, maxLength, type } = field

  if (type === 'file' && Array.isArray(value)) {
    const files = value as FileItem[]
    if (files.some((f) => f.status === 'uploading')) return t('uploading')
    if (files.some((f) => f.status === 'error')) return t('uploadFailed')
    if (maxLength !== undefined && files.length > maxLength)
      return count('maxLength', 'maxCount', maxLength)
    const big = field.maxSize ? files.find((f) => f.size > field.maxSize!) : undefined
    if (big)
      return say('maxSize', 'maxSize', {
        name: big.name,
        max: showSize(field.maxSize!),
        maxSize: showSize(field.maxSize!),
      })
    const wrong = field.accept ? files.find((f) => !acceptsFile(field.accept!, f)) : undefined
    if (wrong) return say('accept', 'accept', { name: wrong.name })
    return undefined
  }

  if ((type === 'rows' || type === 'group') && Array.isArray(value)) {
    const rows = value as Row[]
    if (minLength !== undefined && rows.length < minLength)
      return count('minLength', 'minCount', minLength)
    if (maxLength !== undefined && rows.length > maxLength)
      return count('maxLength', 'maxCount', maxLength)
    if (field.sum) {
      const { column, equals, min: lo, max: hi } = field.sum
      const total = Math.round(rows.reduce((s, r) => s + (Number(r[column]) || 0), 0) * 100) / 100
      const label = field.columns?.find((c) => c.name === column)?.label ?? column
      if (equals !== undefined && total !== equals)
        return say('sum', 'sumEquals', { label, equals, total })
      if (lo !== undefined && total < lo) return say('sum', 'sumMin', { label, min: lo, total })
      if (hi !== undefined && total > hi) return say('sum', 'sumMax', { label, max: hi, total })
    }
    return undefined
  }

  if (Array.isArray(value)) {
    if (minLength !== undefined && value.length < minLength)
      return count('minLength', 'minCount', minLength)
    if (maxLength !== undefined && value.length > maxLength)
      return count('maxLength', 'maxCount', maxLength)
    return undefined
  }

  if (type === 'duration') {
    const n = Number(value)
    if (Number.isNaN(n)) return say('type', 'duration')
    if (min !== undefined && n < Number(min))
      return say('min', 'minNumber', { min: showDuration(Number(min)) })
    if (max !== undefined && n > Number(max))
      return say('max', 'maxNumber', { max: showDuration(Number(max)) })
    return undefined
  }

  if (type === 'number' || type === 'currency' || type === 'percent' || typeof value === 'number') {
    const n = Number(value)
    if (Number.isNaN(n)) return say('type', 'number')
    if (min !== undefined && n < Number(min))
      return say('min', 'minNumber', { min: formatNumber(Number(min), undefined, locale) })
    if (max !== undefined && n > Number(max))
      return say('max', 'maxNumber', { max: formatNumber(Number(max), undefined, locale) })
    return undefined
  }

  if (typeof value !== 'string') return undefined

  if (type === 'phone') {
    const digits = phoneDigits(value)
    return digits.length < 6 || digits.length > 15 ? say('type', 'phone') : undefined
  }

  if (type === 'richtext') {
    const length = plainText(value).length
    if (maxLength !== undefined && length > maxLength)
      return say('maxLength', 'maxChars', { count: maxLength, max: maxLength })
    if (minLength !== undefined && length < minLength)
      return say('minLength', 'minChars', { count: minLength, min: minLength })
    return undefined
  }

  if (type === 'daterange') {
    const [start, end] = value.split('/')
    if (!start || !end) return say('type', 'rangeIncomplete')
    if (end < start) return say('type', 'rangeOrder')
    if (min !== undefined && start < limitOf(min, 'date'))
      return say('min', 'rangeMin', { min: showDate(limitOf(min, 'date'), locale) })
    if (max !== undefined && end > limitOf(max, 'date'))
      return say('max', 'rangeMax', { max: showDate(limitOf(max, 'date'), locale) })
    return undefined
  }

  if (type === 'datetime') {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return say('type', 'datetime')
    if (min !== undefined && value < String(min))
      return say('min', 'minTime', { min: showDateTime(String(min), locale) })
    if (max !== undefined && value > String(max))
      return say('max', 'maxTime', { max: showDateTime(String(max), locale) })
    return undefined
  }

  if (type === 'email' && !EMAIL.test(value)) return say('type', 'email')
  if (type === 'url' && !URL_PATTERN.test(value)) return say('type', 'url')

  if (type === 'date' || type === 'time' || type === 'month') {
    const [minKey, maxKey] = type === 'time' ? ['minTime', 'maxTime'] : ['minDate', 'maxDate']
    if (min !== undefined && value < limitOf(min, type))
      return say('min', minKey, { min: showLimit(limitOf(min, type), type, locale) })
    if (max !== undefined && value > limitOf(max, type))
      return say('max', maxKey, { max: showLimit(limitOf(max, type), type, locale) })
    return undefined
  }

  if (minLength !== undefined && value.length < minLength)
    return say('minLength', 'minChars', { count: minLength, min: minLength })
  if (maxLength !== undefined && value.length > maxLength)
    return say('maxLength', 'maxChars', { count: maxLength, max: maxLength })
  if (field.pattern && !new RegExp(field.pattern).test(value)) return say('pattern', 'pattern')

  return undefined
}

function validateItems(
  field: FieldDef,
  items: Row[],
  values: FormValues,
  path: string,
  fieldTypes: FieldTypeMap,
  context: Context,
  errors: FormErrors,
) {
  items.forEach((item, i) => {
    const ctx = scope(values, item)
    for (const sub of itemFields(field)) {
      if (!isVisible(sub, ctx, context.roles)) continue
      const value = sub.compute ? sub.compute(ctx) : item[sub.name]
      const key = `${path}.${i}.${sub.name}`
      const error = validateField(sub, value, ctx, fieldTypes, context)
      if (error) errors[key] = error
      if (isNested(sub) && Array.isArray(value))
        validateItems(sub, value as Row[], ctx, key, fieldTypes, context, errors)
    }
  })
}

export function validateFields(
  fields: FieldDef[],
  values: FormValues,
  fieldTypes: FieldTypeMap = {},
  context: Context = {},
): FormErrors {
  const errors: FormErrors = {}
  for (const field of fields) {
    if (!isVisible(field, values, context.roles)) continue
    const value = field.compute ? field.compute(values) : values[field.name]
    const error = validateField(field, value, values, fieldTypes, context)
    if (error) errors[field.name] = error
    if (isNested(field) && Array.isArray(value))
      validateItems(field, value as Row[], values, field.name, fieldTypes, context, errors)
  }
  return errors
}

export function validateRecord(
  sections: FormSection[],
  values: FormValues,
  fieldTypes: FieldTypeMap = {},
  context: Context = {},
) {
  return validateFields(visibleFields(sections, values, context.roles), values, fieldTypes, context)
}

export function formatValue(
  field: FieldDef,
  value: FieldValue | undefined,
  fieldTypes: FieldTypeMap = {},
  context: Context = {},
): string {
  const t = context.t ?? defaultT
  const { locale } = context
  const custom = fieldTypes[field.type]
  if (custom?.format) return custom.format(value, field)
  if (isEmptyValue(value) || (field.type === 'richtext' && isRichEmpty(value))) return t('empty')
  if (typeof value === 'boolean') return value ? t('yes') : t('no')
  if (field.type === 'file') return (value as FileItem[]).map((f) => f.name).join(', ')
  if (field.type === 'rows') return t('rows', { count: (value as Row[]).length })
  if (field.type === 'group') {
    const n = (value as Row[]).length
    return `${n} ${nounFor(field, n, t)}`
  }
  if (Array.isArray(value)) return (value as string[]).map((v) => optionLabel(field, v)).join(', ')
  const text = String(value)
  if (field.type === 'date') return showDate(text, locale)
  if (field.type === 'datetime') return showDateTime(text, locale)
  if (field.type === 'daterange') return formatDateRange(text, locale) || t('empty')
  if (field.type === 'lookup') return optionLabel(field, text)
  if (field.type === 'richtext') return plainText(text)
  if (field.type === 'signature') return t('signed')
  if (field.type === 'duration') return showDuration(Number(text))
  if (field.type === 'percent') return `${formatNumber(Number(text), field.decimals, locale)}%`
  if ((field.type === 'number' || field.type === 'currency') && !Number.isNaN(Number(text)))
    return formatNumber(Number(text), field.decimals, locale)
  if (field.type === 'month') return showMonth(text, locale)
  if (field.type === 'time') return showTime(text, locale)
  if (field.type === 'select' || field.type === 'radio') return optionLabel(field, text)
  return text
}

export function diffValues(
  sections: FormSection[],
  before: FormValues,
  after: FormValues,
  fieldTypes: FieldTypeMap = {},
  context: Context = {},
): Change[] {
  const changes: Change[] = []
  for (const field of visibleFields(sections, after, context.roles)) {
    const a = formatValue(field, before[field.name], fieldTypes, context)
    const b = formatValue(field, after[field.name], fieldTypes, context)
    if (a !== b) changes.push({ id: field.name, label: field.label, from: a, to: b })
    else if (JSON.stringify(before[field.name]) !== JSON.stringify(after[field.name]))
      changes.push({ id: field.name, label: field.label, from: a, to: `${b} *` })
  }
  return changes
}
