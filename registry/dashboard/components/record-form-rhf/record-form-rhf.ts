'use client'

import { useCallback } from 'react'
import {
  useFormState,
  useWatch,
  type FieldErrors,
  type FieldValues,
  type Resolver as HookFormResolver,
  type UseFormReturn,
} from 'react-hook-form'

import {
  validateRecord,
  type FieldTypeMap,
  type FieldValue,
  type FormErrors,
  type FormSection,
  type FormValues,
  type Context,
} from '@/registry/dashboard/components/record-form/schema'
import {
  standardSchema,
  type StandardSchema,
} from '@/registry/dashboard/components/record-form/standard-schema'

function nest<T extends FieldValues>(flat: FormErrors): FieldErrors<T> {
  const out: Record<string, unknown> = {}
  for (const [path, message] of Object.entries(flat)) {
    const keys = path.split('.')
    let node = out
    keys.forEach((key, i) => {
      if (i === keys.length - 1) node[key] = { type: 'validate', message }
      else node = (node[key] ??= {}) as Record<string, unknown>
    })
  }
  return out as FieldErrors<T>
}

function flatten(errors: unknown, prefix = '', out: FormErrors = {}) {
  if (!errors || typeof errors !== 'object') return out
  for (const [key, node] of Object.entries(errors as Record<string, unknown>)) {
    if (key === 'ref' || key === 'types' || !node || typeof node !== 'object') continue
    const path = prefix ? `${prefix}.${key}` : key
    const message = (node as { message?: unknown }).message
    if (typeof message === 'string' && message) out[path] = message
    flatten(node, path, out)
  }
  return out
}

export function recordFormResolver<T extends FieldValues = FieldValues>({
  sections,
  fieldTypes,
  schema,
  context,
}: {
  sections: FormSection[]
  fieldTypes?: FieldTypeMap
  schema?: StandardSchema
  context?: Context
}): HookFormResolver<T> {
  const check = schema ? standardSchema(schema) : undefined
  return async (values) => {
    const flat = {
      ...validateRecord(sections, values as FormValues, fieldTypes, context),
      ...(check ? await check(values as FormValues) : {}),
    }
    return Object.keys(flat).length ? { values: {}, errors: nest<T>(flat) } : { values, errors: {} }
  }
}

export function useRecordFormBinding<T extends FieldValues>(
  form: UseFormReturn<T>,
  { validateOnBlur = false }: { validateOnBlur?: boolean } = {},
) {
  const values = useWatch({ control: form.control }) as FormValues
  const { errors, isSubmitted, isSubmitting } = useFormState({ control: form.control })
  const { setValue, trigger } = form

  const onChange = useCallback(
    (name: string, value: FieldValue) =>
      setValue(name as never, value as never, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: isSubmitted,
      }),
    [setValue, isSubmitted],
  )

  const onBlurField = useCallback(
    (name: string) => {
      if (validateOnBlur || isSubmitted) void trigger(name as never)
    },
    [trigger, validateOnBlur, isSubmitted],
  )

  const validateStep = useCallback((names: string[]) => trigger(names as never), [trigger])

  return {
    values,
    errors: flatten(errors),
    submitting: isSubmitting,
    onChange,
    onBlurField,
    validateStep,
  }
}
