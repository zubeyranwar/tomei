'use client'

import { useEffect, useRef, useState } from 'react'
import { Maximize2, Undo2 } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Dialog } from '@/registry/dashboard/components/dialog/dialog'

import { useFormConfig } from './context'

type Point = { x: number; y: number }
type Stroke = Point[]
type Mode = 'draw' | 'type'

const W = 1000
const H = 250
const INK = '#111111'
const FONT = 'italic 96px "Brush Script MT", "Segoe Script", "Snell Roundhand", cursive'

function paint(
  canvas: HTMLCanvasElement,
  strokes: Stroke[],
  typed: string,
  mode: Mode,
  base: HTMLImageElement | null,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const scale = canvas.width / W
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  if (base) ctx.drawImage(base, 0, 0, W, H)
  ctx.strokeStyle = INK
  ctx.fillStyle = INK
  if (mode === 'type') {
    if (!typed.trim()) return
    ctx.font = FONT
    ctx.textBaseline = 'middle'
    ctx.fillText(typed, 40, H / 2, W - 80)
    return
  }
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 5
  for (const stroke of strokes) {
    if (!stroke.length) continue
    ctx.beginPath()
    ctx.moveTo(stroke[0].x, stroke[0].y)
    if (stroke.length === 1) ctx.lineTo(stroke[0].x + 0.1, stroke[0].y)
    for (let i = 1; i < stroke.length - 1; i++) {
      const mid = { x: (stroke[i].x + stroke[i + 1].x) / 2, y: (stroke[i].y + stroke[i + 1].y) / 2 }
      ctx.quadraticCurveTo(stroke[i].x, stroke[i].y, mid.x, mid.y)
    }
    if (stroke.length > 1) ctx.lineTo(stroke.at(-1)!.x, stroke.at(-1)!.y)
    ctx.stroke()
  }
}

function exportPng(strokes: Stroke[], typed: string, mode: Mode, base: HTMLImageElement | null) {
  const canvas = document.createElement('canvas')
  canvas.width = W * 2
  canvas.height = H * 2
  paint(canvas, strokes, typed, mode, base)
  return canvas.toDataURL('image/png')
}

function Pad({
  strokes,
  typed,
  mode,
  base,
  label,
  onStroke,
  className,
}: {
  strokes: Stroke[]
  typed: string
  mode: Mode
  base: HTMLImageElement | null
  label: string
  onStroke: (stroke: Stroke) => void
  className?: string
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const live = useRef<Stroke | null>(null)
  const latest = useRef({ strokes, typed, mode, base })

  useEffect(() => {
    latest.current = { strokes, typed, mode, base }
    if (canvas.current) paint(canvas.current, strokes, typed, mode, base)
  }, [strokes, typed, mode, base])

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const observer = new ResizeObserver(() => {
      const ratio = window.devicePixelRatio || 1
      c.width = Math.round(c.clientWidth * ratio)
      c.height = Math.round(c.clientHeight * ratio)
      const { strokes: s, typed: t, mode: m, base: b } = latest.current
      paint(c, s, t, m, b)
    })
    observer.observe(c)
    return () => observer.disconnect()
  }, [])

  const point = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    }
  }

  const repaintLive = () => {
    const c = canvas.current
    if (!c || !live.current) return
    paint(c, [...strokes, live.current], typed, mode, base)
  }

  return (
    <canvas
      ref={canvas}
      role="img"
      aria-label={label}
      className={cn(
        'block aspect-[4/1] w-full touch-none',
        mode === 'draw' && 'cursor-crosshair',
        className,
      )}
      onPointerDown={(e) => {
        if (mode !== 'draw') return
        e.currentTarget.setPointerCapture(e.pointerId)
        live.current = [point(e)]
        repaintLive()
      }}
      onPointerMove={(e) => {
        if (!live.current) return
        const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent]
        const rect = e.currentTarget.getBoundingClientRect()
        for (const ev of events)
          live.current.push({
            x: ((ev.clientX - rect.left) / rect.width) * W,
            y: ((ev.clientY - rect.top) / rect.height) * H,
          })
        repaintLive()
      }}
      onPointerUp={() => {
        if (!live.current) return
        const stroke = live.current
        live.current = null
        onStroke(stroke)
      }}
      onPointerCancel={() => {
        live.current = null
        repaintLive()
      }}
    />
  )
}

function Paper({ children, invalid }: { children: React.ReactNode; invalid?: boolean }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-white text-neutral-900',
        invalid ? 'border-destructive' : 'border-input',
      )}
    >
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute right-[4%] bottom-[22%] left-[4%] border-b border-dashed border-neutral-300"
      />
    </div>
  )
}

function Controls({
  mode,
  typed,
  canUndo,
  canClear,
  onMode,
  onTyped,
  onUndo,
  onClear,
  children,
}: {
  mode: Mode
  typed: string
  canUndo: boolean
  canClear: boolean
  onMode: (mode: Mode) => void
  onTyped: (text: string) => void
  onUndo: () => void
  onClear: () => void
  children?: React.ReactNode
}) {
  const { t } = useFormConfig()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        role="radiogroup"
        aria-label={t('signatureMethod')}
        className="flex rounded-md bg-muted p-0.5 text-xs"
      >
        {(['draw', 'type'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            onClick={() => onMode(m)}
            className={cn(
              'h-6 rounded px-2 capitalize',
              mode === m ? 'bg-card font-medium shadow-(--shadow-button)' : 'text-muted-foreground',
            )}
          >
            {t(m)}
          </button>
        ))}
      </div>
      {mode === 'type' && (
        <input
          autoFocus
          value={typed}
          placeholder={t('typeName')}
          aria-label={t('typeName')}
          onChange={(e) => onTyped(e.target.value)}
          className="h-7 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus:border-ring"
        />
      )}
      <div className="ml-auto flex items-center gap-1">
        {mode === 'draw' && (
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 [&_svg]:size-3"
          >
            <Undo2 /> {t('undo')}
          </button>
        )}
        <button
          type="button"
          onClick={onClear}
          disabled={!canClear}
          className="h-7 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          {t('clear')}
        </button>
        {children}
      </div>
    </div>
  )
}

export function SignatureField({
  id,
  value,
  disabled,
  invalid,
  describedBy,
  onChange,
}: {
  id: string
  value: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  onChange: (value: string) => void
}) {
  const { t } = useFormConfig()
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [typed, setTyped] = useState('')
  const [mode, setMode] = useState<Mode>('draw')
  const [base, setBase] = useState<HTMLImageElement | null>(null)
  const [expanded, setExpanded] = useState(false)
  const snapshot = useRef<{
    strokes: Stroke[]
    typed: string
    mode: Mode
    base: HTMLImageElement | null
    value: string
  } | null>(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current || !value) return
    loaded.current = true
    const img = new Image()
    img.onload = () => setBase(img)
    img.src = value
  }, [value])

  const update = (next: {
    strokes?: Stroke[]
    typed?: string
    mode?: Mode
    base?: HTMLImageElement | null
  }) => {
    const s = next.strokes ?? strokes
    const t = next.typed ?? typed
    const m = next.mode ?? mode
    const b = next.base === undefined ? base : next.base
    if (next.strokes) setStrokes(s)
    if (next.typed !== undefined) setTyped(t)
    if (next.mode) setMode(m)
    if (next.base !== undefined) setBase(b)
    const empty = m === 'type' ? !t.trim() : !s.length && !b
    onChange(empty ? '' : exportPng(s, t, m, b))
  }

  const clear = () => update({ strokes: [], typed: '', base: null })
  const hasInk = mode === 'type' ? !!typed.trim() : strokes.length > 0 || !!base

  const open = () => {
    snapshot.current = { strokes, typed, mode, base, value }
    setExpanded(true)
  }
  const cancel = () => {
    const s = snapshot.current
    if (s) {
      setStrokes(s.strokes)
      setTyped(s.typed)
      setMode(s.mode)
      setBase(s.base)
      onChange(s.value)
    }
    setExpanded(false)
  }

  if (disabled) {
    return value ? (
      <div className="overflow-hidden rounded-lg border bg-white">
        <img
          id={id}
          src={value}
          alt={t('sign')}
          className="block aspect-[4/1] w-full object-contain"
        />
      </div>
    ) : (
      <span id={id} className="text-sm text-muted-foreground">
        {t('notSigned')}
      </span>
    )
  }

  const controls = (
    <Controls
      mode={mode}
      typed={typed}
      canUndo={strokes.length > 0}
      canClear={hasInk}
      onMode={(m) => update({ mode: m, strokes: [], typed: '', base: null })}
      onTyped={(t) => update({ typed: t })}
      onUndo={() => update({ strokes: strokes.slice(0, -1) })}
      onClear={clear}
    />
  )

  return (
    <div id={id} aria-describedby={describedBy} className="flex flex-col gap-1.5">
      <Paper invalid={invalid}>
        <Pad
          strokes={strokes}
          typed={typed}
          mode={mode}
          base={base}
          label={
            mode === 'draw' ? 'Signature pad. Draw with a mouse, finger or pen.' : 'Typed signature'
          }
          onStroke={(s) => update({ strokes: [...strokes, s] })}
        />
        {!hasInk && mode === 'draw' && (
          <span className="pointer-events-none absolute bottom-[6%] left-[4%] text-xs text-neutral-400">
            {t('signAbove')}
          </span>
        )}
        <button
          type="button"
          aria-label={t('expandSignature')}
          title={t('expand')}
          onClick={open}
          className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-md bg-white/90 text-neutral-500 shadow-sm ring-1 ring-neutral-200 hover:text-neutral-900 [&_svg]:size-3.5"
        >
          <Maximize2 />
        </button>
      </Paper>
      {controls}

      <Dialog
        open={expanded}
        onOpenChange={(next) => !next && cancel()}
        title={t('sign')}
        size="full"
        closeLabel={t('closeWithoutSaving')}
      >
        <div className="flex flex-col gap-3">
          <Paper>
            <Pad
              strokes={strokes}
              typed={typed}
              mode={mode}
              base={base}
              label={t('signaturePad')}
              onStroke={(s) => update({ strokes: [...strokes, s] })}
            />
            {!hasInk && mode === 'draw' && (
              <span className="pointer-events-none absolute bottom-[6%] left-[4%] text-sm text-neutral-400">
                {t('signAbove')}
              </span>
            )}
          </Paper>
          <Controls
            mode={mode}
            typed={typed}
            canUndo={strokes.length > 0}
            canClear={hasInk}
            onMode={(m) => update({ mode: m, strokes: [], typed: '', base: null })}
            onTyped={(t) => update({ typed: t })}
            onUndo={() => update({ strokes: strokes.slice(0, -1) })}
            onClear={clear}
          >
            <button
              type="button"
              data-autofocus
              onClick={() => setExpanded(false)}
              className="ml-1 h-8 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t('done')}
            </button>
          </Controls>
        </div>
      </Dialog>
    </div>
  )
}
