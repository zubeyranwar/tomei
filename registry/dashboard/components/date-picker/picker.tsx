'use client'

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

import { label as labelOf, type PickerLabels } from './locale'

export type PickerBaseProps = {
  id?: string
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  clearable?: boolean
  className?: string
  locale?: string
  labels?: Partial<PickerLabels>
}

const CloseContext = createContext<() => void>(() => {})

export const usePickerClose = () => useContext(CloseContext)

type PickerProps = PickerBaseProps & {
  icon: React.ReactNode
  text?: string
  label: string
  panelClassName?: string
  onClear?: () => void
  children: React.ReactNode
}

export function Picker({
  id,
  icon,
  text,
  label,
  placeholder,
  disabled,
  invalid,
  describedBy,
  clearable = true,
  className,
  panelClassName,
  onClear,
  children,
  labels,
}: PickerProps) {
  const [open, setOpen] = useState(false)
  const [place, setPlace] = useState<{ top: number; left: number } | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  const close = () => {
    setOpen(false)
    trigger.current?.focus()
  }

  useLayoutEffect(() => {
    if (!open) return
    const update = () => {
      if (!panel.current || !trigger.current) return
      const t = trigger.current.getBoundingClientRect()
      const p = panel.current.getBoundingClientRect()
      const gap = 6
      const below = window.innerHeight - t.bottom - gap
      const above = t.top - gap
      const up = below < p.height && above > below
      const left = Math.max(8, Math.min(t.left, window.innerWidth - p.width - 8))
      setPlace({ top: Math.max(8, up ? t.top - gap - p.height : t.bottom + gap), left })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setOpen(false)
      trigger.current?.focus()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  const showClear = clearable && !!text && !disabled && !!onClear

  return (
    <div ref={root} className={cn('relative w-full min-w-0', className)}>
      <button
        ref={trigger}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={describedBy}
        data-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className={cn(
          'flex h-8 w-full min-w-0 items-center gap-2 rounded-lg border border-input bg-card pl-2.5 text-left text-sm whitespace-nowrap text-foreground transition-[border-color] duration-150 outline-none hover:border-ring focus-visible:border-ring disabled:cursor-default disabled:bg-muted/40 disabled:hover:border-input data-invalid:border-destructive [&_svg]:size-3.5 [&_svg]:shrink-0',
          showClear ? 'pr-8' : 'pr-2.5',
          open && 'border-ring',
        )}
      >
        <span className="flex text-muted-foreground">{icon}</span>
        <span className={cn('min-w-0 flex-1 truncate', !text && 'text-muted-foreground')}>
          {text || placeholder}
        </span>
      </button>
      {showClear && (
        <button
          type="button"
          aria-label={labelOf(labels, 'clearValue')}
          onClick={() => {
            onClear()
            trigger.current?.focus()
          }}
          className="absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-3"
        >
          <X />
        </button>
      )}
      {open && (
        <div
          ref={panel}
          style={{
            top: place?.top ?? 0,
            left: place?.left ?? 0,
            visibility: place ? 'visible' : 'hidden',
          }}
          role="dialog"
          aria-label={label}
          className={cn(
            'fixed z-[60] rounded-xl bg-popover text-popover-foreground shadow-(--shadow-overlay)',
            panelClassName,
          )}
        >
          <CloseContext value={close}>{children}</CloseContext>
        </div>
      )}
    </div>
  )
}

export function NavButton({
  direction,
  label,
  onClick,
}: {
  direction: -1 | 1
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
        <path
          d={direction < 0 ? 'M10 3 5 8l5 5' : 'm6 3 5 5-5 5'}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export function PickerInput({
  value,
  placeholder,
  label,
  invalid,
  autoFocus,
  onChange,
  onCommit,
  onKeyDown,
  inputRef,
}: {
  value: string
  placeholder: string
  label: string
  invalid?: boolean
  autoFocus?: boolean
  onChange: (value: string) => void
  onCommit: () => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  inputRef?: React.Ref<HTMLInputElement>
}) {
  return (
    <input
      ref={inputRef}
      value={value}
      placeholder={placeholder}
      aria-label={label}
      aria-invalid={invalid || undefined}
      autoFocus={autoFocus}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          onCommit()
        }
        onKeyDown?.(e)
      }}
      className="h-8 w-full min-w-0 rounded-lg border border-input bg-card px-2.5 text-sm tabular-nums outline-none placeholder:text-muted-foreground focus:border-ring aria-invalid:border-destructive"
    />
  )
}

export function PickerFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-2 border-t pt-3">{children}</div>
}

export function FooterButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-7 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}
