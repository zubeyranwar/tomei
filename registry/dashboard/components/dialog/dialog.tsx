'use client'

import { useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, X } from 'lucide-react'

import { cn } from '@/lib/utils'

import { useModal, usePresence } from './modal'

export { useModal, usePresence }

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[min(72rem,100%)]',
}

export type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
  size?: keyof typeof sizes
  dismissible?: boolean
  hideClose?: boolean
  initialFocus?: React.RefObject<HTMLElement | null>
  closeLabel?: string
  className?: string
  children?: React.ReactNode
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  footer,
  size = 'md',
  dismissible = true,
  hideClose = false,
  initialFocus,
  closeLabel = 'Close',
  className,
  children,
}: DialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const { present, visible } = usePresence(open)
  const { panel } = useModal({
    open,
    onClose: () => onOpenChange(false),
    dismissible,
    initialFocus,
  })

  if (!present || typeof document === 'undefined') return null

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[150] flex items-end justify-center p-3 transition-opacity duration-150 motion-reduce:transition-none sm:items-center sm:p-6',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-black/50"
        onPointerDown={() => dismissible && onOpenChange(false)}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[calc(100svh-1.5rem)] w-full flex-col rounded-2xl bg-card text-card-foreground shadow-(--shadow-overlay) transition-transform duration-150 ease-out outline-none motion-reduce:transition-none sm:max-h-[calc(100svh-3rem)]',
          sizes[size],
          visible ? 'translate-none scale-none' : 'translate-y-2 scale-[0.98]',
          className,
        )}
      >
        <header className="flex items-start gap-3 px-5 pt-5 pb-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {!hideClose && (
            <button
              type="button"
              aria-label={closeLabel}
              onClick={() => onOpenChange(false)}
              className="-mt-1 -mr-2 flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-4"
            >
              <X />
            </button>
          )}
        </header>
        {children && <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>}
        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}

export type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
  onConfirm: () => void | Promise<void>
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false)
  const confirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !busy && onOpenChange(next)}
      size="sm"
      dismissible={!busy}
      hideClose
      title={
        <span className="flex items-center gap-2">
          {tone === 'danger' && <AlertTriangle className="size-4 text-destructive" />}
          {title}
        </span>
      }
      description={description}
      footer={
        <>
          <button
            type="button"
            disabled={busy}
            onClick={() => onOpenChange(false)}
            className="h-8 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            data-autofocus
            disabled={busy}
            aria-busy={busy || undefined}
            onClick={() => void confirm()}
            className={cn(
              'h-8 rounded-lg px-3 text-sm font-medium disabled:opacity-60',
              tone === 'danger'
                ? 'bg-destructive text-white hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            {busy ? '…' : confirmLabel}
          </button>
        </>
      }
    />
  )
}
