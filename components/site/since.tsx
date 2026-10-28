'use client'

import { useSyncExternalStore } from 'react'

const DAY = 86_400_000
const subscribe = () => () => {}

function label(date: string) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / DAY)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? '' : 's'} ago`
  return new Date(date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

export function Since({ date }: { date: string }) {
  const text = useSyncExternalStore(
    subscribe,
    () => label(date),
    () => date,
  )
  return <>{text}</>
}

export const isRecent = (date?: string) =>
  !!date && Date.now() - new Date(date).getTime() < 30 * DAY
