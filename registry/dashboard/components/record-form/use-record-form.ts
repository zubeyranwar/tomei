'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useFormConfig, useResolvedConfig, type RecordFormSettings } from './context'
import {
  clearDraft,
  readDraft,
  useLeaveWarning,
  writeDraft,
  type AutosaveState,
  type DraftState,
} from './drafts'
import type { FieldTypeRenderer } from './field-control'
import {
  applyComputed,
  diffValues,
  validateRecord,
  type FieldValue,
  type FormErrors,
  type FormSection,
  type FormValues,
} from './schema'
import type { Resolver } from './standard-schema'

export type ValidateOn = 'submit' | 'blur' | 'change'

type Options = {
  sections: FormSection[]
  initialValues: FormValues
  fieldTypes?: Record<string, FieldTypeRenderer>
  resolver?: Resolver
  validateOn?: ValidateOn
  onSubmit?: (values: FormValues) => void | Promise<void>
  draftKey?: string
  autosave?: { save: (values: FormValues) => Promise<void>; delay?: number }
  warnOnLeave?: boolean
} & RecordFormSettings

const touches = (key: string, name: string) => key === name || key.startsWith(`${name}.`)

export function useRecordForm({
  sections,
  initialValues,
  fieldTypes,
  resolver,
  validateOn = 'submit',
  onSubmit,
  draftKey,
  autosave,
  warnOnLeave = true,
  ...settings
}: Options) {
  const parent = useFormConfig()
  const config = useResolvedConfig(settings, parent)
  const context = useMemo(
    () => ({ t: config.t, locale: config.locale, roles: config.roles }),
    [config.t, config.locale, config.roles],
  )
  const [saved, setSaved] = useState(() => applyComputed(sections, initialValues))
  const [values, setValuesState] = useState(saved)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<ReadonlySet<string>>(() => new Set())
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const latest = useRef(values)
  const run = useRef(0)

  const collect = useCallback(
    async (vals: FormValues) => ({
      ...validateRecord(sections, vals, fieldTypes, context),
      ...(resolver ? await resolver(vals) : {}),
    }),
    [sections, fieldTypes, resolver, context],
  )

  const check = useCallback(
    async (vals: FormValues, only?: string) => {
      const id = ++run.current
      const found = await collect(vals)
      if (id !== run.current) return found
      if (!only) setErrors(found)
      else
        setErrors((prev) => {
          const next = Object.fromEntries(Object.entries(prev).filter(([k]) => !touches(k, only)))
          for (const [k, v] of Object.entries(found)) if (touches(k, only)) next[k] = v
          return next
        })
      return found
    },
    [collect],
  )

  const setValues = useCallback(
    (next: FormValues) => {
      const computed = applyComputed(sections, next)
      latest.current = computed
      setValuesState(computed)
      return computed
    },
    [sections],
  )

  const setValue = useCallback(
    (name: string, value: FieldValue) => {
      const next = setValues({ ...latest.current, [name]: value })
      if (validateOn === 'change' || submitted) void check(next, name)
      else
        setErrors((prev) =>
          Object.keys(prev).some((k) => touches(k, name))
            ? Object.fromEntries(Object.entries(prev).filter(([k]) => !touches(k, name)))
            : prev,
        )
    },
    [setValues, validateOn, submitted, check],
  )

  const onBlurField = useCallback(
    (name: string) => {
      setTouched((prev) => (prev.has(name) ? prev : new Set(prev).add(name)))
      if (validateOn === 'blur' || submitted) void check(latest.current, name)
    },
    [validateOn, submitted, check],
  )

  const validateStep = useCallback(
    async (names: string[]) => {
      const id = ++run.current
      const found = await collect(latest.current)
      if (id !== run.current) return false
      const mine = Object.entries(found).filter(([k]) => names.some((n) => touches(k, n)))
      setErrors((prev) => {
        const next = Object.fromEntries(
          Object.entries(prev).filter(([k]) => !names.some((n) => touches(k, n))),
        )
        for (const [k, v] of mine) next[k] = v
        return next
      })
      return mine.length === 0
    },
    [collect],
  )

  const validate = useCallback(async () => {
    const found = await check(latest.current)
    return Object.keys(found).length === 0
  }, [check])

  const submit = useCallback(async () => {
    setSubmitted(true)
    if (!(await validate())) return false
    setSubmitting(true)
    try {
      await onSubmit?.(latest.current)
      setSaved(latest.current)
      if (draftKey) clearDraft(draftKey)
      setSubmitted(false)
      return true
    } finally {
      setSubmitting(false)
    }
  }, [validate, onSubmit, draftKey])

  const reset = useCallback(
    (next?: FormValues) => {
      const base = next ? applyComputed(sections, next) : saved
      if (next) setSaved(base)
      latest.current = base
      setValuesState(base)
      setErrors({})
      setTouched(new Set())
      setSubmitted(false)
    },
    [sections, saved],
  )

  const changes = useMemo(
    () => diffValues(sections, saved, values, fieldTypes, context),
    [sections, saved, values, fieldTypes, context],
  )
  const dirty = changes.length > 0

  const [draft, setDraft] = useState<{ values: FormValues; savedAt: Date } | null>(null)
  useEffect(() => {
    if (!draftKey) return
    const found = readDraft(draftKey)
    if (found && JSON.stringify(found.values) !== JSON.stringify(latest.current))
      queueMicrotask(() => setDraft(found))
  }, [draftKey])

  useEffect(() => {
    if (!draftKey) return
    if (!dirty) return clearDraft(draftKey)
    const timer = setTimeout(() => writeDraft(draftKey, values), 600)
    return () => clearTimeout(timer)
  }, [draftKey, dirty, values])

  const draftState: DraftState | null = draft
    ? {
        savedAt: draft.savedAt,
        restore: () => {
          setValues(draft.values)
          setDraft(null)
        },
        discard: () => {
          if (draftKey) clearDraft(draftKey)
          setDraft(null)
        },
      }
    : null

  const [autoStatus, setAutoStatus] = useState<Omit<AutosaveState, 'retry'>>({ status: 'idle' })
  const saveNow = useCallback(async () => {
    if (!autosave) return
    const snapshot = latest.current
    setAutoStatus((s) => ({ ...s, status: 'saving' }))
    try {
      await autosave.save(snapshot)
      setSaved(snapshot)
      if (draftKey) clearDraft(draftKey)
      setAutoStatus({ status: 'saved', savedAt: new Date() })
    } catch (error) {
      setAutoStatus({ status: 'error', error: error instanceof Error ? error.message : undefined })
    }
  }, [autosave, draftKey])

  useEffect(() => {
    if (!autosave || !dirty) return
    queueMicrotask(() =>
      setAutoStatus((s) => (s.status === 'saving' ? s : { ...s, status: 'pending' })),
    )
    const timer = setTimeout(() => void saveNow(), autosave.delay ?? 1500)
    return () => clearTimeout(timer)
  }, [autosave, dirty, values, saveNow])

  const autosaveState: AutosaveState | undefined = autosave
    ? { ...autoStatus, retry: () => void saveNow() }
    : undefined

  const uploading = Object.values(values).some(
    (v) =>
      Array.isArray(v) &&
      v.some(
        (item) =>
          item && typeof item === 'object' && 'status' in item && item.status === 'uploading',
      ),
  )
  useLeaveWarning(warnOnLeave && (dirty || uploading))

  return {
    values,
    saved,
    errors,
    touched,
    changes,
    dirty,
    uploading,
    draft: draftState,
    autosave: autosaveState,
    saveNow,
    submitted,
    submitting,
    setValue,
    setValues,
    setErrors,
    validate,
    validateStep,
    submit,
    reset,
    formProps: {
      sections,
      values,
      errors,
      fieldTypes,
      submitting,
      onChange: setValue,
      onBlurField,
      validateStep,
      draft: draftState,
      autosave: autosaveState,
      onSubmit: () => void submit(),
      ...settings,
    },
  }
}
