'use client'

import { useCallback, useEffect, useState } from 'react'

type State<T> = { past: T[]; present: T; future: T[]; mergeKey: string | null }

type SetOptions = { merge?: string }

export function useHistory<T>(initial: T, { hotkeys = false }: { hotkeys?: boolean } = {}) {
  const [state, setState] = useState<State<T>>({
    past: [],
    present: initial,
    future: [],
    mergeKey: null,
  })

  const set = useCallback((next: T | ((current: T) => T), { merge }: SetOptions = {}) => {
    setState((s) => {
      const value = typeof next === 'function' ? (next as (current: T) => T)(s.present) : next
      const merging = merge !== undefined && merge === s.mergeKey
      return {
        past: merging ? s.past : [...s.past, s.present],
        present: value,
        future: [],
        mergeKey: merge ?? null,
      }
    })
  }, [])

  const undo = useCallback(() => {
    setState((s) =>
      s.past.length
        ? {
            past: s.past.slice(0, -1),
            present: s.past[s.past.length - 1],
            future: [s.present, ...s.future],
            mergeKey: null,
          }
        : s,
    )
  }, [])

  const redo = useCallback(() => {
    setState((s) =>
      s.future.length
        ? {
            past: [...s.past, s.present],
            present: s.future[0],
            future: s.future.slice(1),
            mergeKey: null,
          }
        : s,
    )
  }, [])

  const reset = useCallback(
    (value?: T) =>
      setState((s) => ({ past: [], present: value ?? s.present, future: [], mergeKey: null })),
    [],
  )

  useEffect(() => {
    if (!hotkeys) return
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') return
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable="true"]')) return
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hotkeys, undo, redo])

  return {
    value: state.present,
    set,
    undo,
    redo,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  }
}
