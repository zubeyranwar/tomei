'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

export type TimelineEvent = { id: string; content: React.ReactNode; time: string }

type TimelineProps = {
  events: TimelineEvent[]
  onComment?: (text: string) => void
  placeholder?: string
  className?: string
}

const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })

export function Timeline({
  events,
  onComment,
  placeholder = 'Leave a comment',
  className,
}: TimelineProps) {
  const [draft, setDraft] = useState('')
  const [posted, setPosted] = useState<TimelineEvent[]>([])

  const post = () => {
    const text = draft.trim()
    if (!text) return
    setPosted([
      { id: `c-${Date.now()}`, content: text, time: timeFormat.format(new Date()) },
      ...posted,
    ])
    onComment?.(text)
    setDraft('')
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          post()
        }}
        className="flex items-center gap-2 rounded-lg border border-input bg-card p-1 pl-3 focus-within:border-ring"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-7 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {draft.trim() && (
          <button
            type="submit"
            className="h-7 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground"
          >
            Post
          </button>
        )}
      </form>
      <ol className="flex flex-col">
        {[...posted, ...events].map((event, i, all) => (
          <li key={event.id} className="relative grid grid-cols-[1rem_1fr_auto] gap-2 pb-5">
            {i < all.length - 1 && (
              <span aria-hidden className="absolute top-3 bottom-0 left-[3.5px] w-px bg-border" />
            )}
            <span aria-hidden className="mt-1.5 size-2 rounded-full bg-muted-foreground/40" />
            <span className="text-sm">{event.content}</span>
            <time className="text-xs whitespace-nowrap text-muted-foreground">{event.time}</time>
          </li>
        ))}
      </ol>
    </div>
  )
}
