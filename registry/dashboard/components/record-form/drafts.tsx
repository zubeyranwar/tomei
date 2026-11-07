'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, Check, FileClock, Loader2 } from 'lucide-react'
import { useFormState, useWatch, type UseFormReturn } from 'react-hook-form'

import { cn } from '@/lib/utils'

import { useFormConfig } from './context'
import { formatRelative } from './dates'
import type { FormValues } from './schema'

export type DraftState = { savedAt: Date; restore: () => void; discard: () => void }

export type AutosaveState = {
  status: 'idle' | 'pending' | 'saving' | 'saved' | 'error'
  savedAt?: Date
  error?: string
  retry: () => void
}

type StoredDraft = { values: FormValues; savedAt: string }

const storageKey = (key: string) => `record-form:draft:${key}`

export function readDraft(key: string): { values: FormValues; savedAt: Date } | null {
  try {
    const raw = window.localStorage.getItem(storageKey(key))
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredDraft
    return { values: parsed.values, savedAt: new Date(parsed.savedAt) }
  } catch {
    return null
  }
}

export function writeDraft(key: string, values: FormValues) {
  try {
    const stored: StoredDraft = { values, savedAt: new Date().toISOString() }
    window.localStorage.setItem(storageKey(key), JSON.stringify(stored))
  } catch {}
}

export function clearDraft(key: string) {
  try {
    window.localStorage.removeItem(storageKey(key))
  } catch {}
}

export function useLeaveWarning(active: boolean, message?: string) {
  const { t } = useFormConfig()
  const text = message ?? t('leaveWarning')
  useEffect(() => {
    if (!active) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = text
      return text
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [active, text])
}

export function useDraft(form: UseFormReturn<FormValues>, key?: string): DraftState | null {
  const values = useWatch({ control: form.control }) as FormValues
  const { isDirty } = useFormState({ control: form.control })
  const [found, setFound] = useState<{ values: FormValues; savedAt: Date } | null>(null)

  useEffect(() => {
    if (!key) return
    const draft = readDraft(key)
    if (draft && JSON.stringify(draft.values) !== JSON.stringify(form.getValues()))
      queueMicrotask(() => setFound(draft))
  }, [key, form])

  useEffect(() => {
    if (!key || found) return
    if (!isDirty) return clearDraft(key)
    const timer = setTimeout(() => writeDraft(key, values), 600)
    return () => clearTimeout(timer)
  }, [key, found, isDirty, values])

  if (!key || !found) return null
  return {
    savedAt: found.savedAt,
    restore: () => {
      form.reset(found.values, { keepDefaultValues: true })
      setFound(null)
    },
    discard: () => {
      clearDraft(key)
      setFound(null)
    },
  }
}

export type AutosaveOptions = { save: (values: FormValues) => Promise<void>; delay?: number }

export function useAutosave(
  form: UseFormReturn<FormValues>,
  options?: AutosaveOptions,
): AutosaveState | undefined {
  const values = useWatch({ control: form.control })
  const { isDirty } = useFormState({ control: form.control })
  const [state, setState] = useState<Omit<AutosaveState, 'retry'>>({ status: 'idle' })
  const latest = useRef(options)
  useEffect(() => {
    latest.current = options
  })

  const saveNow = useCallback(async () => {
    const save = latest.current?.save
    if (!save) return
    const snapshot = form.getValues()
    setState((s) => ({ ...s, status: 'saving' }))
    try {
      await save(snapshot)
      form.reset(snapshot, {
        keepValues: true,
        keepErrors: true,
        keepTouched: true,
        keepIsSubmitted: true,
      })
      setState({ status: 'saved', savedAt: new Date() })
    } catch (error) {
      setState({ status: 'error', error: error instanceof Error ? error.message : undefined })
    }
  }, [form])

  const enabled = !!options
  const delay = options?.delay ?? 1500
  useEffect(() => {
    if (!enabled || !isDirty) return
    queueMicrotask(() => setState((s) => (s.status === 'saving' ? s : { ...s, status: 'pending' })))
    const timer = setTimeout(() => void saveNow(), delay)
    return () => clearTimeout(timer)
  }, [enabled, isDirty, values, delay, saveNow])

  return enabled ? { ...state, retry: () => void saveNow() } : undefined
}

export function DraftBanner({ draft, className }: { draft: DraftState; className?: string }) {
  const { t, locale } = useFormConfig()
  return (
    <div
      role="status"
      className={cn(
        'mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-muted px-3 py-2.5 text-sm [&_svg]:size-4',
        className,
      )}
    >
      <FileClock className="shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        {t('draftFound', { time: formatRelative(draft.savedAt, locale) })}
      </span>
      <span className="flex gap-1.5">
        <button
          type="button"
          onClick={draft.discard}
          className="h-7 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:bg-card hover:text-foreground"
        >
          {t('discard')}
        </button>
        <button
          type="button"
          onClick={draft.restore}
          className="h-7 rounded-lg bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t('restore')}
        </button>
      </span>
    </div>
  )
}

export function SaveStatus({ state, className }: { state: AutosaveState; className?: string }) {
  const { t, locale } = useFormConfig()
  if (state.status === 'idle') return null
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex items-center gap-1.5 text-xs [&_svg]:size-3.5',
        state.status === 'error' ? 'text-destructive' : 'text-muted-foreground',
        className,
      )}
    >
      {state.status === 'saving' && (
        <>
          <Loader2 className="animate-spin motion-reduce:animate-none" /> {t('autosaving')}
        </>
      )}
      {state.status === 'pending' && t('unsaved')}
      {state.status === 'saved' && (
        <>
          <Check />
          {state.savedAt
            ? t('autosavedAt', { time: formatRelative(state.savedAt, locale) })
            : t('autosaved')}
        </>
      )}
      {state.status === 'error' && (
        <>
          <AlertCircle /> {t('autosaveFailed')}
          <button
            type="button"
            onClick={state.retry}
            className="font-medium underline-offset-2 hover:underline"
          >
            {t('retry')}
          </button>
        </>
      )}
    </span>
  )
}
