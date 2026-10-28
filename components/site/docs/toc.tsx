'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

export function Toc({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [sections])

  return (
    <nav className="sticky top-28 flex flex-col gap-2">
      <p className="mb-1 eyebrow text-muted-foreground">On this page</p>
      {sections.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          className={cn(
            'text-[0.9375rem] transition-colors',
            active === id ? 'text-signal' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {label}
        </a>
      ))}
    </nav>
  )
}
