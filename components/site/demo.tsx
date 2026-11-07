'use client'

import { lazy, Suspense } from 'react'

import { demos } from '@/registry/__index__'

const lazyDemos = Object.fromEntries(
  Object.entries(demos).map(([name, load]) => [name, lazy(load)]),
)

export function Demo({ name }: { name: string }) {
  const Component = lazyDemos[name]
  return <Suspense>{Component && <Component />}</Suspense>
}
