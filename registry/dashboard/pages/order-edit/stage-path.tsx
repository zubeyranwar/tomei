'use client'

import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

type StagePathProps = {
  stages: string[]
  value: string
  onChange: (stage: string) => void
  className?: string
}

export function StagePath({ stages, value, onChange, className }: StagePathProps) {
  const current = stages.indexOf(value)

  return (
    <ol
      aria-label="Stage"
      className={cn('flex gap-1 overflow-x-auto rounded-xl bg-muted p-1', className)}
    >
      {stages.map((stage, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={stage} className="min-w-24 flex-1">
            <button
              type="button"
              aria-current={active ? 'step' : undefined}
              onClick={() => onChange(stage)}
              className={cn(
                'flex h-8 w-full items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors',
                active && 'bg-primary text-primary-foreground shadow-(--shadow-button-primary)',
                done && 'bg-card text-foreground shadow-(--shadow-button)',
                !active && !done && 'text-muted-foreground hover:bg-card/60 hover:text-foreground',
              )}
            >
              {done && <Check className="size-3.5" />}
              {stage}
            </button>
          </li>
        )
      })}
    </ol>
  )
}
