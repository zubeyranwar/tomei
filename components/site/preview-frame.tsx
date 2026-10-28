'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

const VIEWPORT = 1440

export function PreviewFrame({
  name,
  title,
  interactive = false,
  className,
}: {
  name: string
  title: string
  interactive?: boolean
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / VIEWPORT))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={cn('relative overflow-hidden bg-background', className)}>
      {scale > 0 && (
        <iframe
          src={`/preview/${name}`}
          title={title}
          loading="lazy"
          tabIndex={interactive ? 0 : -1}
          className={cn(
            'absolute top-0 left-0 origin-top-left',
            !interactive && 'pointer-events-none',
          )}
          style={{ width: VIEWPORT, height: `${100 / scale}%`, transform: `scale(${scale})` }}
        />
      )}
    </div>
  )
}
