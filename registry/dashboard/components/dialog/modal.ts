'use client'

import { useEffect, useRef, useState } from 'react'

const stack: symbol[] = []
let locks = 0
let saved = { overflow: '', paddingRight: '' }

function lockScroll() {
  if (locks++ > 0) return
  const body = document.body
  saved = { overflow: body.style.overflow, paddingRight: body.style.paddingRight }
  const gap = window.innerWidth - document.documentElement.clientWidth
  body.style.overflow = 'hidden'
  if (gap > 0) body.style.paddingRight = `${gap}px`
}

function unlockScroll() {
  if (--locks > 0) return
  document.body.style.overflow = saved.overflow
  document.body.style.paddingRight = saved.paddingRight
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'

export function usePresence(open: boolean, duration = 180) {
  const [present, setPresent] = useState(open)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (open) {
      const a = requestAnimationFrame(() => {
        setPresent(true)
        requestAnimationFrame(() => setVisible(true))
      })
      return () => cancelAnimationFrame(a)
    }
    const a = requestAnimationFrame(() => setVisible(false))
    const timer = setTimeout(() => setPresent(false), duration)
    return () => {
      cancelAnimationFrame(a)
      clearTimeout(timer)
    }
  }, [open, duration])
  return { present: present || open, visible: visible && open }
}

export function useModal({
  open,
  onClose,
  dismissible = true,
  initialFocus,
}: {
  open: boolean
  onClose: () => void
  dismissible?: boolean
  initialFocus?: React.RefObject<HTMLElement | null>
}) {
  const panel = useRef<HTMLDivElement>(null)
  const close = useRef(onClose)

  useEffect(() => {
    close.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const id = Symbol('modal')
    stack.push(id)
    lockScroll()
    const previous = document.activeElement as HTMLElement | null
    const frame = requestAnimationFrame(() => {
      const target =
        initialFocus?.current ??
        panel.current?.querySelector<HTMLElement>('[autofocus], [data-autofocus]') ??
        panel.current?.querySelector<HTMLElement>(FOCUSABLE) ??
        panel.current
      target?.focus()
    })

    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !dismissible || stack[stack.length - 1] !== id) return
      event.stopPropagation()
      close.current()
    }
    const onKey = (event: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return
      if (event.key !== 'Tab' || !panel.current) return
      const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (!items.length) {
        event.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('keydown', onEscape)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('keydown', onEscape)
      stack.splice(stack.indexOf(id), 1)
      unlockScroll()
      if (previous?.isConnected) previous.focus()
    }
  }, [open, dismissible, initialFocus])

  return { panel }
}
