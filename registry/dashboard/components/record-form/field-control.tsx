'use client'

import { useMemo } from 'react'

import { cn } from '@/lib/utils'
import { Input } from '@/registry/dashboard/components/input/input'

import { DatePicker } from '@/registry/dashboard/components/date-picker/date-picker'
import { pickerLabels, type PickerLabels } from '@/registry/dashboard/components/date-picker/locale'
import { DateRangeField } from '@/registry/dashboard/components/date-picker/date-range-field'
import { DateTimePicker } from '@/registry/dashboard/components/date-picker/date-time-picker'
import { MonthPicker } from '@/registry/dashboard/components/date-picker/month-picker'
import { TimePicker } from '@/registry/dashboard/components/date-picker/time-picker'

import { ListField, MultiSelectField, RadioField, SelectField, ToggleField } from './controls'
import { useFormConfig } from './context'
import { FileField } from './files'
import type { T } from './i18n'
import { GroupField } from './group'
import { AddressField, LookupField } from './lookup'
import { DurationField, NumberField } from './number-input'
import { PhoneField } from './phone'
import { RichTextField } from './rich-text'
import { RowsField } from './rows'
import { SignatureField } from './signature'
import type {
  CustomFieldType,
  FieldDef,
  FieldValue,
  FileItem,
  FormErrors,
  FormValues,
} from './schema'

export type FieldRenderProps = {
  id: string
  field: FieldDef
  value: FieldValue | undefined
  values: FormValues
  invalid: boolean
  disabled: boolean
  describedBy?: string
  onChange: (value: FieldValue) => void
}

export type FieldTypeRenderer = CustomFieldType & {
  render: (props: FieldRenderProps) => React.ReactNode
}

export type FieldControlProps = FieldRenderProps & {
  path?: string
  currency?: string
  errors?: FormErrors
  fieldTypes?: Record<string, FieldTypeRenderer>
}

const pickerAliases: Partial<Record<keyof PickerLabels, string>> = {
  today: 'today',
  now: 'now',
  thisMonth: 'thisMonth',
  clear: 'clear',
  clearValue: 'clear',
  pickDate: 'pickDate',
  pickTime: 'pickTime',
  pickMonth: 'pickMonth',
  pickDates: 'pickDates',
  pickDateTime: 'pickDateTime',
}

function pickerLabelsFrom(t: T): PickerLabels {
  return Object.fromEntries(
    (Object.keys(pickerLabels) as (keyof PickerLabels)[]).map((key) => {
      const own = t(`picker.${key}`)
      if (own !== `picker.${key}`) return [key, own]
      const alias = pickerAliases[key]
      return [key, alias ? t(alias) : pickerLabels[key]]
    }),
  ) as PickerLabels
}

function limit(value: number | string | undefined, type: 'date' | 'time' | 'month') {
  if (value === undefined) return undefined
  if (value !== 'today') return String(value)
  const d = new Date()
  const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return type === 'month' ? ymd.slice(0, 7) : type === 'date' ? ymd : undefined
}

const asText = (value: FieldValue | undefined) =>
  typeof value === 'string' ? value : typeof value === 'number' ? String(value) : ''
const asList = (value: FieldValue | undefined) => (Array.isArray(value) ? (value as string[]) : [])

export function FieldControl(props: FieldControlProps) {
  const {
    id,
    field,
    value,
    invalid,
    disabled,
    describedBy,
    onChange,
    currency = '$',
    fieldTypes = {},
  } = props
  const { t, locale } = useFormConfig()
  const labels = useMemo(() => pickerLabelsFrom(t), [t])
  const custom = fieldTypes[field.type]
  if (custom) return custom.render(props)

  const text = asText(value)
  const common = { id, disabled, invalid, describedBy }

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          id={id}
          value={text}
          readOnly={disabled}
          placeholder={field.placeholder}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-20 w-full rounded-lg border border-input bg-card px-2.5 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground read-only:bg-muted/40 focus:border-ring aria-invalid:border-destructive"
        />
      )
    case 'select':
      return (
        <SelectField
          {...common}
          value={text}
          options={field.options ?? []}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      )
    case 'multiselect':
      return (
        <MultiSelectField
          {...common}
          value={asList(value)}
          options={field.options ?? []}
          creatable={field.creatable}
          display={field.display}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      )
    case 'toggle':
      return (
        <ToggleField
          {...common}
          value={value === true}
          label={field.placeholder}
          onChange={onChange}
        />
      )
    case 'radio':
      return (
        <RadioField
          {...common}
          value={text}
          options={field.options ?? []}
          display={field.display}
          onChange={onChange}
        />
      )
    case 'date':
      return (
        <DatePicker
          {...common}
          value={text}
          min={limit(field.min, 'date')}
          max={limit(field.max, 'date')}
          placeholder={field.placeholder}
          clearable={!field.required}
          locale={locale}
          labels={labels}
          onChange={onChange}
        />
      )
    case 'time':
      return (
        <TimePicker
          {...common}
          value={text}
          step={field.step}
          min={limit(field.min, 'time')}
          max={limit(field.max, 'time')}
          placeholder={field.placeholder}
          clearable={!field.required}
          locale={locale}
          labels={labels}
          onChange={onChange}
        />
      )
    case 'month':
      return (
        <MonthPicker
          {...common}
          value={text}
          min={limit(field.min, 'month')}
          max={limit(field.max, 'month')}
          placeholder={field.placeholder}
          clearable={!field.required}
          locale={locale}
          labels={labels}
          onChange={onChange}
        />
      )
    case 'list':
      return (
        <ListField
          {...common}
          value={asList(value)}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      )
    case 'file':
      return (
        <FileField
          {...common}
          value={Array.isArray(value) ? (value as FileItem[]) : []}
          accept={field.accept}
          multiple={field.multiple ?? true}
          maxSize={field.maxSize}
          maxFiles={field.maxLength}
          onChange={onChange}
        />
      )
    case 'rows':
      return <RowsField {...props} Control={FieldControl} />
    case 'group':
      return <GroupField {...props} Control={FieldControl} />
    case 'number':
    case 'currency':
    case 'percent':
      return (
        <NumberField
          {...common}
          value={text}
          decimals={field.decimals}
          placeholder={field.placeholder}
          leading={field.type === 'currency' ? currency.trim() : undefined}
          trailing={field.type === 'percent' ? '%' : undefined}
          onChange={onChange}
        />
      )
    case 'duration':
      return (
        <DurationField
          {...common}
          value={text}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      )
    case 'phone':
      return (
        <PhoneField
          {...common}
          value={text}
          defaultCountry={field.defaultCountry}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      )
    case 'lookup':
      return (
        <LookupField
          {...common}
          value={field.multiple ? asList(value) : text}
          multiple={field.multiple}
          search={field.search}
          options={field.options}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      )
    case 'address':
      return (
        <AddressField
          {...common}
          value={text}
          search={field.search}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      )
    case 'daterange':
      return (
        <DateRangeField
          {...common}
          value={text}
          min={limit(field.min, 'date')}
          max={limit(field.max, 'date')}
          placeholder={field.placeholder}
          clearable={!field.required}
          locale={locale}
          labels={labels}
          onChange={onChange}
        />
      )
    case 'datetime':
      return (
        <DateTimePicker
          {...common}
          value={text}
          step={field.step}
          min={field.min === undefined ? undefined : String(field.min)}
          max={field.max === undefined ? undefined : String(field.max)}
          placeholder={field.placeholder}
          clearable={!field.required}
          locale={locale}
          labels={labels}
          onChange={onChange}
        />
      )
    case 'richtext':
      return (
        <RichTextField
          {...common}
          value={text}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      )
    case 'signature':
      return <SignatureField {...common} value={text} onChange={onChange} />
    default:
      return (
        <Input
          id={id}
          value={text}
          readOnly={disabled}
          placeholder={field.placeholder}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          type={field.type === 'email' ? 'email' : 'text'}
          inputMode={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn(disabled && 'bg-muted/40')}
        />
      )
  }
}
