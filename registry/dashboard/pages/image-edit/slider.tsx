'use client'

import { useRef } from 'react'

import { cn } from '@/lib/utils'

type SliderProps = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  origin?: number
  format?: (value: number) => string
  onStart?: () => void
  onChange: (value: number) => void
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  origin = Math.max(min, Math.min(max, 0)),
  format = (v) => (v > 0 && min < 0 ? `+${v}` : `${v}`),
  onStart,
  onChange,
}: SliderProps) {
  const track = useRef<HTMLDivElement>(null)
  const pct = (v: number) => ((v - min) / (max - min)) * 100
  const snap = (v: number) => {
    const next = Math.round(Math.min(max, Math.max(min, v)) / step) * step
    return Number(next.toFixed(4))
  }

  const fromPointer = (clientX: number) => {
    const rect = track.current!.getBoundingClientRect()
    onChange(snap(min + ((clientX - rect.left) / rect.width) * (max - min)))
  }

  const from = Math.min(pct(value), pct(origin))
  const to = Math.max(pct(value), pct(origin))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <button
          type="button"
          onClick={() => {
            onStart?.()
            onChange(origin)
          }}
          title="Reset"
          className={cn(
            'rounded px-1 font-mono text-xs tabular-nums',
            value === origin ? 'text-muted-foreground' : 'text-foreground hover:bg-muted',
          )}
        >
          {format(value)}
        </button>
      </div>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={format(value)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          onStart?.()
          fromPointer(e.clientX)
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e.clientX)
        }}
        onDoubleClick={() => {
          onStart?.()
          onChange(origin)
        }}
        onKeyDown={(e) => {
          const big = (max - min) / 10
          const moves: Record<string, number> = {
            ArrowLeft: -step,
            ArrowDown: -step,
            ArrowRight: step,
            ArrowUp: step,
            PageDown: -big,
            PageUp: big,
          }
          let next: number
          if (e.key in moves) next = snap(value + moves[e.key] * (e.shiftKey ? 10 : 1))
          else if (e.key === 'Home') next = min
          else if (e.key === 'End') next = max
          else return
          e.preventDefault()
          if (!e.repeat) onStart?.()
          onChange(next)
        }}
        className="group relative flex h-5 cursor-pointer touch-none items-center rounded-full outline-none"
      >
        <div className="absolute inset-x-0 h-1 rounded-full bg-muted" />
        <div
          className="absolute h-1 rounded-full bg-foreground"
          style={{ left: `${from}%`, width: `${to - from}%` }}
        />
        {min < origin && (
          <div
            className="absolute h-2.5 w-px -translate-x-1/2 bg-muted-foreground/50"
            style={{ left: `${pct(origin)}%` }}
          />
        )}
        <div
          className="absolute size-4 -translate-x-1/2 rounded-full border bg-card shadow-sm transition-transform group-focus-visible:ring-2 group-focus-visible:ring-ring/60 group-active:scale-110"
          style={{ left: `${pct(value)}%` }}
        />
      </div>
    </div>
  )
}
