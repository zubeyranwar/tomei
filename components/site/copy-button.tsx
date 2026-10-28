'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

export function CopyButton({
  value,
  label = 'Copy',
  className,
}: {
  value: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'rounded-md bg-secondary px-2.5 py-1.5 eyebrow transition-colors hover:bg-primary hover:text-primary-foreground',
        className,
      )}
    >
      {copied ? 'Copied' : label}
    </button>
  )
}
