'use client'

import { useEffect } from 'react'
import { AlertCircle, Check, FileClock, Loader2 } from 'lucide-react'

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
