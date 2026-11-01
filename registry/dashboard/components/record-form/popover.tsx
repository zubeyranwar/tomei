'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

type PopoverProps = {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode
  align?: 'start' | 'end'
  side?: 'top' | 'bottom'
  className?: string
  children: React.ReactNode | ((close: () => void) => React.ReactNode)
}

type Place = { top: number; left: number; minWidth: number }

export function placePanel(
  anchor: DOMRect,
  panel: { width: number; height: number },
  align: 'start' | 'end',
  side: 'top' | 'bottom',
): { top: number; left: number } {
  const gap = 6
  const below = window.innerHeight - anchor.bottom - gap
  const above = anchor.top - gap
  const up =
    side === 'top' ? above >= panel.height || above > below : below < panel.height && above > below
  const top = up ? anchor.top - gap - panel.height : anchor.bottom + gap
  const rawLeft = align === 'end' ? anchor.right - panel.width : anchor.left
  const left = Math.max(8, Math.min(rawLeft, window.innerWidth - panel.width - 8))
  return { top: Math.max(8, top), left }
}

export function useFloating(
  open: boolean,
  align: 'start' | 'end' = 'start',
  side: 'top' | 'bottom' = 'bottom',
) {
  const anchor = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const [place, setPlace] = useState<Place | null>(null)

  useLayoutEffect(() => {
    if (!open) return
    const update = () => {
      if (!anchor.current || !panel.current) return
      const a = anchor.current.getBoundingClientRect()
      const p = panel.current.getBoundingClientRect()
      setPlace({ ...placePanel(a, p, align, side), minWidth: a.width })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, align, side])

  return { anchor, panel, place }
}

export function Popover({
  trigger,
  align = 'start',
  side = 'bottom',
  className,
  children,
}: PopoverProps) {
  const [open, setOpen] = useState(false)
  const { anchor, panel, place } = useFloating(open, align, side)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!anchor.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, anchor])

  return (
    <div ref={anchor} className="relative flex w-full">
      {trigger({ open, toggle: () => setOpen(!open) })}
      {open && (
        <div
          ref={panel}
          style={{
            top: place?.top ?? 0,
            left: place?.left ?? 0,
            minWidth: place?.minWidth,
            visibility: place ? 'visible' : 'hidden',
          }}
          className={cn(
            'fixed z-[60] min-w-48 rounded-xl bg-popover p-1.5 text-popover-foreground shadow-(--shadow-overlay)',
            className?.replace(/\bw-full\b/g, ''),
          )}
        >
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  )
}
