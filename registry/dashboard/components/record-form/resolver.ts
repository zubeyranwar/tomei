import type { FieldErrors, Resolver } from 'react-hook-form'

import { createT, type Messages, type Translate } from './i18n'
import {
  applyComputed,
  validateRecord,
  type FieldTypeMap,
  type FormErrors,
  type FormSection,
  type FormValues,
} from './schema'

type PathSegment = PropertyKey | { readonly key: PropertyKey }

type StandardIssue = { readonly message: string; readonly path?: ReadonlyArray<PathSegment> }

type StandardResult =
  | { readonly value: unknown; readonly issues?: undefined }
  | { readonly issues: ReadonlyArray<StandardIssue> }

export type StandardSchema = {
  readonly '~standard': {
    readonly version: 1
    readonly vendor: string
    readonly validate: (value: unknown) => StandardResult | Promise<StandardResult>
  }
}

export const FORM_ERROR = '_form'

export type RecordFormResolverOptions = {
  sections: FormSection[]
  schema?: StandardSchema
  fieldTypes?: FieldTypeMap
  roles?: string[]
  locale?: string
  messages?: Messages
  translate?: Translate
}

function issuesToErrors(issues: ReadonlyArray<StandardIssue>): FormErrors {
  const errors: FormErrors = {}
  for (const issue of issues) {
    const key =
      issue.path
        ?.map((p) => String(typeof p === 'object' && p !== null && 'key' in p ? p.key : p))
        .join('.') || FORM_ERROR
    errors[key] ??= issue.message
  }
  return errors
}

function nestErrors(flat: FormErrors): FieldErrors<FormValues> {
  const out: Record<string, unknown> = {}
  for (const [path, message] of Object.entries(flat)) {
    const keys = path.split('.')
    let node = out
    keys.forEach((key, i) => {
      if (i === keys.length - 1) node[key] = { ...(node[key] as object), type: 'validate', message }
      else node = (node[key] ??= {}) as Record<string, unknown>
    })
  }
  return out as FieldErrors<FormValues>
}

export function flattenErrors(errors: unknown, prefix = '', out: FormErrors = {}): FormErrors {
  if (!errors || typeof errors !== 'object') return out
  for (const [key, node] of Object.entries(errors as Record<string, unknown>)) {
    if (key === 'ref' || key === 'types' || !node || typeof node !== 'object') continue
    const path = prefix ? `${prefix}.${key}` : key
    const message = (node as { message?: unknown }).message
    if (typeof message === 'string' && message) out[path] = message
    flattenErrors(node, path, out)
  }
  return out
}

export function recordFormResolver({
  sections,
  schema,
  fieldTypes,
  roles,
  locale,
  messages,
  translate,
}: RecordFormResolverOptions): Resolver<FormValues> {
  const t = createT({ messages, translate, locale })
  return async (values) => {
    const computed = applyComputed(sections, values)
    const result = schema ? await schema['~standard'].validate(computed) : undefined
    const errors = {
      ...validateRecord(sections, computed, fieldTypes, { t, locale, roles }),
      ...(result?.issues ? issuesToErrors(result.issues) : {}),
    }
    return Object.keys(errors).length
      ? { values: {}, errors: nestErrors(errors) }
      : { values: computed, errors: {} }
  }
}
