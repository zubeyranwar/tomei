'use client'

import {
  Crop,
  FlipHorizontal2,
  FlipVertical2,
  RotateCcw,
  RotateCw,
  Sparkles,
  SunMedium,
} from 'lucide-react'

import { Button } from '@/registry/dashboard/components/button/button'
import { cn } from '@/lib/utils'

import { adjustments, aspects, defaultEdit, filters, type Edit, type StageImage } from './edits'
import { Picture } from './picture'
import { Slider } from './slider'

export type Tab = 'adjust' | 'filters' | 'crop'

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'adjust', label: 'Adjust', icon: <SunMedium /> },
  { id: 'filters', label: 'Filters', icon: <Sparkles /> },
  { id: 'crop', label: 'Crop', icon: <Crop /> },
]

type PanelProps = {
  tab: Tab
  image?: StageImage
  edit: Edit
  onTab: (tab: Tab) => void
  onEdit: (next: Edit, merge?: string) => void
  onStart: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</h3>
      {children}
    </section>
  )
}

export function Panel({ tab, image, edit, onTab, onEdit, onStart }: PanelProps) {
  const edited = JSON.stringify(edit) !== JSON.stringify(defaultEdit)
  const crop = (patch: Partial<Edit['crop']>, merge?: string) =>
    onEdit({ ...edit, crop: { ...edit.crop, ...patch } }, merge)

  return (
    <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
      <div
        role="tablist"
        aria-label="Edit tools"
        className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => onTab(t.id)}
            className={cn(
              'flex h-8 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors [&_svg]:size-3.5',
              tab === t.id
                ? 'bg-card text-foreground shadow-(--shadow-button)'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'adjust' && (
        <Section title="Light & colour">
          {adjustments.map((a) => (
            <Slider
              key={a.key}
              label={a.label}
              min={a.min}
              max={a.max}
              value={edit.adjust[a.key]}
              onStart={onStart}
              onChange={(value) =>
                onEdit({ ...edit, adjust: { ...edit.adjust, [a.key]: value } }, a.key)
              }
            />
          ))}
        </Section>
      )}

      {tab === 'filters' && (
        <Section title="Presets">
          <div className="grid grid-cols-3 gap-3">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={edit.filter === f.id}
                onClick={() => onEdit({ ...edit, filter: f.id })}
                className="group flex flex-col gap-1.5 text-left"
              >
                {image ? (
                  <Picture
                    image={image}
                    edit={{ ...edit, filter: f.id }}
                    crop={false}
                    className={cn(
                      'aspect-square w-full rounded-lg ring-offset-2 ring-offset-card transition',
                      edit.filter === f.id ? 'ring-2 ring-foreground' : 'group-hover:opacity-90',
                    )}
                  />
                ) : (
                  <div className="aspect-square w-full rounded-lg bg-muted" />
                )}
                <span
                  className={cn(
                    'text-xs',
                    edit.filter === f.id ? 'font-medium text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {f.label}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Presets stack on top of your adjustments.</p>
        </Section>
      )}

      {tab === 'crop' && (
        <>
          <Section title="Aspect ratio">
            <div className="flex flex-wrap gap-1.5">
              {aspects.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={edit.crop.aspect === a.id}
                  onClick={() => crop({ aspect: a.id, x: 0, y: 0 })}
                  className={cn(
                    'h-7 rounded-full border px-3 text-xs font-medium transition-colors',
                    edit.crop.aspect === a.id
                      ? 'border-foreground bg-foreground text-background'
                      : 'text-muted-foreground hover:border-ring hover:text-foreground',
                  )}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </Section>
          <Section title="Transform">
            <Slider
              label="Zoom"
              min={1}
              max={3}
              step={0.05}
              origin={1}
              format={(v) => `${v.toFixed(2)}×`}
              value={edit.crop.zoom}
              onStart={onStart}
              onChange={(zoom) => crop({ zoom, x: 0, y: 0 }, 'zoom')}
            />
            <Slider
              label="Straighten"
              min={-45}
              max={45}
              format={(v) => `${v}°`}
              value={edit.crop.straighten}
              onStart={onStart}
              onChange={(straighten) => crop({ straighten, x: 0, y: 0 }, 'straighten')}
            />
            <div className="grid grid-cols-4 gap-1.5">
              <Button
                size="icon"
                className="w-full"
                aria-label="Rotate left"
                onClick={() => crop({ turns: (edit.crop.turns + 3) % 4, x: 0, y: 0 })}
              >
                <RotateCcw />
              </Button>
              <Button
                size="icon"
                className="w-full"
                aria-label="Rotate right"
                onClick={() => crop({ turns: (edit.crop.turns + 1) % 4, x: 0, y: 0 })}
              >
                <RotateCw />
              </Button>
              <Button
                size="icon"
                className="w-full"
                aria-label="Flip horizontal"
                aria-pressed={edit.crop.flipX}
                onClick={() => crop({ flipX: !edit.crop.flipX })}
              >
                <FlipHorizontal2 />
              </Button>
              <Button
                size="icon"
                className="w-full"
                aria-label="Flip vertical"
                aria-pressed={edit.crop.flipY}
                onClick={() => crop({ flipY: !edit.crop.flipY })}
              >
                <FlipVertical2 />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Drag the image to reposition it.</p>
          </Section>
        </>
      )}

      <div className="border-t pt-4">
        <Button
          variant="ghost"
          className="w-full"
          disabled={!edited}
          onClick={() => onEdit(defaultEdit)}
        >
          Reset all edits
        </Button>
      </div>
    </aside>
  )
}
