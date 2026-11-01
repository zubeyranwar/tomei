'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Plus, Trash2, Upload } from 'lucide-react'

import { cn } from '@/lib/utils'

import { defaultEdit, panLimit, ratioOf, type Edit, type StageImage } from './edits'
import { Picture } from './picture'

type StageProps = {
  images: StageImage[]
  edits: Record<string, Edit>
  active: number
  cropping: boolean
  comparing: boolean
  onSelect: (index: number) => void
  onImages: (images: StageImage[]) => void
  onPan: (x: number, y: number, start: boolean) => void
}

const fromFile = (file: File): StageImage => ({
  id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
  name: file.name.replace(/\.[^.]+$/, ''),
  src: URL.createObjectURL(file),
})

export function Stage({
  images,
  edits,
  active,
  cropping,
  comparing,
  onSelect,
  onImages,
  onPan,
}: StageProps) {
  const replaceInput = useRef<HTMLInputElement>(null)
  const addInput = useRef<HTMLInputElement>(null)
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const current = images[active]
  const edit = (current && edits[current.id]) ?? defaultEdit
  const shown = comparing ? defaultEdit : edit
  const ratio = ratioOf(shown)

  const replace = (file?: File) => {
    if (!file?.type.startsWith('image/')) return
    if (!current) return onImages([fromFile(file)])
    onImages(images.map((image, i) => (i === active ? fromFile(file) : image)))
  }

  const add = (files: FileList | null) => {
    const added = [...(files ?? [])].filter((f) => f.type.startsWith('image/')).map(fromFile)
    if (!added.length) return
    onImages([...images, ...added])
    onSelect(images.length)
  }

  const remove = () => {
    onImages(images.filter((_, i) => i !== active))
    onSelect(Math.max(0, active - 1))
  }

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          replace(e.dataTransfer.files[0])
        }}
        className={cn(
          'group relative overflow-hidden rounded-2xl bg-muted shadow-(--shadow-card) transition-[width,aspect-ratio] duration-300 motion-reduce:transition-none',
          dragging && 'ring-2 ring-ring ring-offset-4',
        )}
        style={{ aspectRatio: ratio, width: `min(100%, calc(min(64svh, 600px) * ${ratio}))` }}
      >
        {current ? (
          <div
            className={cn('size-full', cropping && 'cursor-grab touch-none active:cursor-grabbing')}
            onPointerDown={(e) => {
              if (!cropping) return
              e.currentTarget.setPointerCapture(e.pointerId)
              drag.current = { px: e.clientX, py: e.clientY, x: edit.crop.x, y: edit.crop.y }
              onPan(edit.crop.x, edit.crop.y, true)
            }}
            onPointerMove={(e) => {
              if (!drag.current) return
              const rect = e.currentTarget.getBoundingClientRect()
              const limit = panLimit(edit)
              const clamp = (v: number) =>
                Math.round(Math.max(-limit, Math.min(limit, v)) * 10) / 10
              onPan(
                clamp(drag.current.x + ((e.clientX - drag.current.px) / rect.width) * 100),
                clamp(drag.current.y + ((e.clientY - drag.current.py) / rect.height) * 100),
                false,
              )
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          >
            <Picture image={current} edit={shown} className="size-full" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => replaceInput.current?.click()}
            className="flex size-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <ImagePlus className="size-6" />
            Drop an image or click to upload
          </button>
        )}

        {cropping && current && (
          <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 border-2 border-white/80">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="border-[0.5px] border-white/40" />
            ))}
          </div>
        )}

        {comparing && (
          <span className="absolute top-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
            Original
          </span>
        )}

        {current && !cropping && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => replaceInput.current?.click()}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-sm font-medium text-neutral-900"
            >
              <Upload className="size-3.5" /> Replace
            </button>
            <button
              type="button"
              onClick={remove}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-white/90 px-3 text-sm font-medium text-red-600"
            >
              <Trash2 className="size-3.5" /> Remove
            </button>
          </div>
        )}

        {dragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm font-medium">
            Drop to replace
          </div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            aria-label={`Edit ${image.name}`}
            aria-pressed={i === active}
            onClick={() => onSelect(i)}
            className={cn(
              'size-14 overflow-hidden rounded-lg ring-offset-2 ring-offset-card transition',
              i === active ? 'ring-2 ring-foreground' : 'opacity-70 hover:opacity-100',
            )}
          >
            <Picture image={image} edit={edits[image.id] ?? defaultEdit} className="size-full" />
          </button>
        ))}
        <button
          type="button"
          aria-label="Add images"
          onClick={() => addInput.current?.click()}
          className="flex size-14 items-center justify-center rounded-lg border border-dashed text-muted-foreground hover:border-ring hover:text-foreground"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <input
        ref={replaceInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          replace(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <input
        ref={addInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          add(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
