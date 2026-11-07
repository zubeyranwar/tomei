import { isValidElement } from 'react'

import { slugify } from '@/lib/slug'
import { cn } from '@/lib/utils'

const text = (node: React.ReactNode): string =>
  typeof node === 'string' || typeof node === 'number'
    ? String(node)
    : Array.isArray(node)
      ? node.map(text).join('')
      : isValidElement<{ children?: React.ReactNode }>(node)
        ? text(node.props.children)
        : ''

export function Heading({
  as: Tag,
  children,
  className,
}: {
  as: 'h2' | 'h3'
  children?: React.ReactNode
  className?: string
}) {
  const id = slugify(text(children))
  return (
    <Tag id={id} className={cn('group scroll-mt-28', className)}>
      <a href={`#${id}`} className="no-underline">
        {children}
        <span aria-hidden className="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100">
          #
        </span>
      </a>
    </Tag>
  )
}
