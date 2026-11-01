'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

export type ToastTone = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading'

export type ToastOptions = {
  id?: string
  description?: React.ReactNode
  tone?: ToastTone
  duration?: number
  action?: { label: string; onClick: () => void }
  onDismiss?: () => void
}

type ToastItem = ToastOptions & {
  id: string
  title: React.ReactNode
  tone: ToastTone
  duration: number
  createdAt: number
}

let toasts: ToastItem[] = []
let mounted = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const snapshot = () => toasts
const EMPTY: ToastItem[] = []
const serverSnapshot = () => EMPTY

let counter = 0
const defaults: Record<ToastTone, number> = {
  default: 5000,
  success: 4000,
  info: 5000,
  warning: 6000,
  error: 8000,
  loading: Infinity,
}

function show(title: React.ReactNode, options: ToastOptions = {}) {
  const id = options.id ?? `t${++counter}`
  const tone = options.tone ?? 'default'
  const existing = toasts.find((t) => t.id === id)
  const item: ToastItem = {
    ...existing,
    ...options,
    id,
    title,
    tone,
    duration: options.duration ?? defaults[tone],
    createdAt: Date.now(),
  }
  toasts = existing ? toasts.map((t) => (t.id === id ? item : t)) : [...toasts, item]
  emit()
  return id
}

function dismiss(id?: string) {
  const gone = id ? toasts.filter((t) => t.id === id) : toasts
  toasts = id ? toasts.filter((t) => t.id !== id) : []
  gone.forEach((t) => t.onDismiss?.())
  emit()
}

type Messages<T> = {
  loading: React.ReactNode
  success: React.ReactNode | ((value: T) => React.ReactNode)
  error: React.ReactNode | ((error: unknown) => React.ReactNode)
}

export const toast = Object.assign(show, {
  success: (title: React.ReactNode, o?: ToastOptions) => show(title, { ...o, tone: 'success' }),
  error: (title: React.ReactNode, o?: ToastOptions) => show(title, { ...o, tone: 'error' }),
  warning: (title: React.ReactNode, o?: ToastOptions) => show(title, { ...o, tone: 'warning' }),
  info: (title: React.ReactNode, o?: ToastOptions) => show(title, { ...o, tone: 'info' }),
  loading: (title: React.ReactNode, o?: ToastOptions) => show(title, { ...o, tone: 'loading' }),
  dismiss,
  promise<T>(promise: Promise<T>, messages: Messages<T>, o?: ToastOptions) {
    const id = show(messages.loading, { ...o, tone: 'loading' })
    promise.then(
      (value) =>
        show(typeof messages.success === 'function' ? messages.success(value) : messages.success, {
          ...o,
          id,
          tone: 'success',
          duration: o?.duration,
        }),
      (error) =>
        show(typeof messages.error === 'function' ? messages.error(error) : messages.error, {
          ...o,
          id,
          tone: 'error',
          duration: o?.duration,
        }),
    )
    return promise
  },
  isMounted: () => mounted > 0,
})

const icons: Record<ToastTone, React.ReactNode> = {
  default: null,
  success: <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" />,
  error: <XCircle className="text-destructive" />,
  warning: <AlertTriangle className="text-amber-600 dark:text-amber-400" />,
  info: <Info className="text-sky-600 dark:text-sky-400" />,
  loading: <Loader2 className="animate-spin text-muted-foreground motion-reduce:animate-none" />,
}

function ToastCard({ item, paused }: { item: ToastItem; paused: boolean }) {
  const [entered, setEntered] = useState(false)
  const remaining = useRef(item.duration)
  const started = useRef(0)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    remaining.current = item.duration
  }, [item.createdAt, item.duration])

  useEffect(() => {
    if (paused || !Number.isFinite(remaining.current)) return
    started.current = Date.now()
    const timer = setTimeout(() => dismiss(item.id), remaining.current)
    return () => {
      clearTimeout(timer)
      remaining.current -= Date.now() - started.current
    }
  }, [paused, item.id, item.createdAt])

  return (
    <li
      role={item.tone === 'error' ? 'alert' : 'status'}
      aria-live={item.tone === 'error' ? 'assertive' : 'polite'}
      aria-atomic
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-xl bg-popover p-3.5 text-sm text-popover-foreground shadow-(--shadow-overlay) transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none [&_svg]:size-4 [&_svg]:shrink-0',
        entered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
      )}
    >
      {icons[item.tone] && <span className="mt-0.5 flex">{icons[item.tone]}</span>}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="font-medium">{item.title}</p>
        {item.description && <p className="text-muted-foreground">{item.description}</p>}
      </div>
      {item.action && (
        <button
          type="button"
          onClick={() => {
            item.action!.onClick()
            dismiss(item.id)
          }}
          className="h-7 shrink-0 rounded-lg bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          {item.action.label}
        </button>
      )}
      {item.tone !== 'loading' && (
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => dismiss(item.id)}
          className="-mt-0.5 -mr-1 flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
        >
          <X />
        </button>
      )}
    </li>
  )
}

const positions = {
  'bottom-right': 'bottom-4 right-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
  'top-right': 'top-4 right-4 items-end',
  'top-left': 'top-4 left-4 items-start',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
}

export function Toaster({
  position = 'bottom-right',
  max = 3,
  className,
}: {
  position?: keyof typeof positions
  max?: number
  className?: string
}) {
  const items = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    mounted++
    return () => {
      mounted--
    }
  }, [])

  const visible = items.slice(-max)
  const top = position.startsWith('top')

  return (
    <section
      aria-label="Notifications"
      tabIndex={-1}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setPaused(false)}
      className={cn(
        'pointer-events-none fixed z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col outline-none',
        positions[position],
        className,
      )}
    >
      <ol className={cn('flex w-full gap-2', top ? 'flex-col' : 'flex-col-reverse')}>
        {[...visible].reverse().map((item) => (
          <ToastCard key={item.id} item={item} paused={paused} />
        ))}
      </ol>
      {items.length > max && (
        <p className="pointer-events-auto mt-2 self-end text-xs text-muted-foreground">
          +{items.length - max} more ·{' '}
          <button type="button" onClick={() => dismiss()} className="font-medium hover:underline">
            Clear all
          </button>
        </p>
      )}
    </section>
  )
}
