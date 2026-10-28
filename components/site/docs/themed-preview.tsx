'use client'

import { useState } from 'react'

import { Tab } from '@/components/site/install-command'
import { PreviewFrame, type PreviewTheme } from '@/components/site/preview-frame'

export function ThemedPreview({ name, title }: { name: string; title: string }) {
  const [theme, setTheme] = useState<PreviewTheme>('light')

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-1">
        {(['light', 'dark'] as const).map((t) => (
          <Tab key={t} active={theme === t} onClick={() => setTheme(t)}>
            {t}
          </Tab>
        ))}
      </div>
      <PreviewFrame
        name={name}
        title={title}
        theme={theme}
        interactive
        className="aspect-[16/10] rounded-2xl border"
      />
    </div>
  )
}
