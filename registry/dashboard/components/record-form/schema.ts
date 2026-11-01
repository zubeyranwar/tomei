export type BuiltInFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'currency'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'toggle'
  | 'radio'

export type FieldType = BuiltInFieldType | (string & {})

export type FieldValue = string | number | boolean | string[] | null
export type FormValues = Record<string, FieldValue | undefined>

export type Condition =
  | {
      field: string
      is?: FieldValue | FieldValue[]
      not?: FieldValue | FieldValue[]
      filled?: boolean
    }
  | { any: Condition[] }
  | { all: Condition[] }

export type Rule = 'required' | 'type' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern'

export type FieldDef = {
  name: string
  label: string
  type: FieldType
  required?: boolean
  requiredWhen?: Condition | Condition[]
  visibleWhen?: Condition | Condition[]
  options?: string[]
  creatable?: boolean
  placeholder?: string
  hint?: string
  span?: 1 | 2 | 3 | 4 | 'full'
  readOnly?: boolean
  min?: number | string
  max?: number | string
  minLength?: number
  maxLength?: number
  pattern?: string
  messages?: Partial<Record<Rule, string>>
  props?: Record<string, unknown>
}

export type FormSection = {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  span?: 1 | 'full'
  defaultOpen?: boolean
  visibleWhen?: Condition | Condition[]
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

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_PATTERN = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/

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
  if (Array.isArray(value)) return value.some((v) => wanted.includes(v))
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

export const isVisible = (item: { visibleWhen?: FieldDef['visibleWhen'] }, values: FormValues) =>
  evaluate(item.visibleWhen, values)

export const isRequired = (field: FieldDef, values: FormValues) =>
  !!field.required || (field.requiredWhen !== undefined && evaluate(field.requiredWhen, values))

export function visibleFields(sections: FormSection[], values: FormValues) {
  return sections
    .filter((s) => isVisible(s, values))
    .flatMap((s) => s.fields)
    .filter((f) => isVisible(f, values))
}

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const dateLimit = (limit: number | string) => (limit === 'today' ? today() : String(limit))

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
const showDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return y && m && d ? dateFormat.format(new Date(y, m - 1, d)) : iso
}

function message(
  field: FieldDef,
  rule: Rule,
  fallback: string,
  vars: Record<string, unknown> = {},
) {
  const template = field.messages?.[rule]
  if (!template) return fallback
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key === 'label' ? field.label : String(vars[key] ?? field[key as keyof FieldDef] ?? ''),
  )
}

export function validateField(
  field: FieldDef,
  value: FieldValue | undefined,
  values: FormValues = {},
  fieldTypes: FieldTypeMap = {},
): string | undefined {
  const custom = fieldTypes[field.type]
  const empty = custom?.isEmpty ? custom.isEmpty(value) : isEmptyValue(value)

  if (empty) {
    return isRequired(field, values)
      ? message(field, 'required', `${field.label} is required`)
      : undefined
  }
  if (custom?.validate) {
    const error = custom.validate(value, field, values)
    if (error) return error
  }

  const { min, max, minLength, maxLength } = field

  if (Array.isArray(value)) {
    if (minLength !== undefined && value.length < minLength)
      return message(field, 'minLength', `Pick at least ${minLength}`)
    if (maxLength !== undefined && value.length > maxLength)
      return message(field, 'maxLength', `Pick at most ${maxLength}`)
    return undefined
  }

  if (field.type === 'number' || field.type === 'currency' || typeof value === 'number') {
    const n = Number(value)
    if (Number.isNaN(n)) return message(field, 'type', 'Enter a number')
    if (min !== undefined && n < Number(min))
      return message(field, 'min', `Must be at least ${min}`)
    if (max !== undefined && n > Number(max)) return message(field, 'max', `Must be at most ${max}`)
    return undefined
  }

  if (typeof value !== 'string') return undefined

  if (field.type === 'email' && !EMAIL.test(value))
    return message(field, 'type', 'Enter a valid email')
  if (field.type === 'url' && !URL_PATTERN.test(value))
    return message(field, 'type', 'Enter a valid URL')

  if (field.type === 'date') {
    if (min !== undefined && value < dateLimit(min))
      return message(field, 'min', `Must be on or after ${showDate(dateLimit(min))}`, {
        min: showDate(dateLimit(min)),
      })
    if (max !== undefined && value > dateLimit(max))
      return message(field, 'max', `Must be on or before ${showDate(dateLimit(max))}`, {
        max: showDate(dateLimit(max)),
      })
    return undefined
  }

  if (minLength !== undefined && value.length < minLength)
    return message(field, 'minLength', `Use at least ${minLength} characters`)
  if (maxLength !== undefined && value.length > maxLength)
    return message(field, 'maxLength', `Use at most ${maxLength} characters`)
  if (field.pattern && !new RegExp(field.pattern).test(value))
    return message(field, 'pattern', 'Invalid format')

  return undefined
}

export function validateRecord(
  sections: FormSection[],
  values: FormValues,
  fieldTypes: FieldTypeMap = {},
) {
  const errors: Record<string, string> = {}
  for (const field of visibleFields(sections, values)) {
    const error = validateField(field, values[field.name], values, fieldTypes)
    if (error) errors[field.name] = error
  }
  return errors
}

export function formatValue(
  field: FieldDef,
  value: FieldValue | undefined,
  fieldTypes: FieldTypeMap = {},
) {
  const custom = fieldTypes[field.type]
  if (custom?.format) return custom.format(value, field)
  if (isEmptyValue(value)) return '—'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (field.type === 'date' && typeof value === 'string') return showDate(value)
  return String(value)
}
