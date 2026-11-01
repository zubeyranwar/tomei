'use client'

import { useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useModal, usePresence } from '@/registry/dashboard/components/dialog/modal'

const sides = {
  right: {
    wrap: 'justify-end',
    panel: 'h-full w-full border-l sm:rounded-l-2xl',
    hidden: 'translate-x-full',
  },
  left: {
    wrap: 'justify-start',
    panel: 'h-full w-full border-r sm:rounded-r-2xl',
    hidden: '-translate-x-full',
  },
  bottom: {
    wrap: 'items-end',
    panel: 'max-h-[90svh] w-full rounded-t-2xl border-t',
    hidden: 'translate-y-full',
  },
}

const widths = { sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-xl', xl: 'sm:max-w-3xl' }

export type DrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  footer?: React.ReactNode
  side?: keyof typeof sides
  size?: keyof typeof widths
  dismissible?: boolean
  initialFocus?: React.RefObject<HTMLElement | null>
  closeLabel?: string
  className?: string
  children?: React.ReactNode
}

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  actions,
  footer,
  side = 'right',
  size = 'md',
  dismissible = true,
  initialFocus,
  closeLabel = 'Close',
  className,
  children,
}: DrawerProps) {
  const titleId = useId()
  const descriptionId = useId()
  const { present, visible } = usePresence(open, 220)
  const { panel } = useModal({
    open,
    onClose: () => onOpenChange(false),
    dismissible,
    initialFocus,
  })
  const s = sides[side]

  if (!present || typeof document === 'undefined') return null

  return createPortal(
    <div className={cn('fixed inset-0 z-[150] flex', s.wrap)}>
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 bg-black/40 transition-opacity duration-200 motion-reduce:transition-none',
          visible ? 'opacity-100' : 'opacity-0',
        )}
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
          'relative flex flex-col bg-card text-card-foreground shadow-(--shadow-overlay) transition-transform duration-200 ease-out outline-none motion-reduce:transition-none',
          s.panel,
          side !== 'bottom' && widths[size],
          visible ? 'translate-none' : s.hidden,
          className,
        )}
      >
        {side === 'bottom' && (
          <span aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-muted" />
        )}
        <header className="flex items-start gap-3 border-b px-5 py-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h2 id={titleId} className="truncate text-base font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
          <button
            type="button"
            aria-label={closeLabel}
            onClick={() => onOpenChange(false)}
            className="-mr-2 flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-4"
          >
            <X />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
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
