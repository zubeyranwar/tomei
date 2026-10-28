'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

type PopoverProps = {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode
  align?: 'start' | 'end'
  className?: string
  children: React.ReactNode
}

export function Popover({ trigger, align = 'start', className, children }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative inline-flex">
      {trigger({ open, toggle: () => setOpen(!open) })}
      {open && (
        <div
          className={cn(
            'absolute top-full z-50 mt-1.5 min-w-48 rounded-xl bg-popover p-1.5 text-popover-foreground shadow-(--shadow-overlay)',
            align === 'end' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}
