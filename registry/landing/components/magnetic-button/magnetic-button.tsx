import { cn } from '@/lib/utils'

import { Magnetic } from './magnetic'

const sizes = {
  sm: 'px-5 py-2.5 text-sm',
  md: 'px-7 py-3.5 text-base',
  lg: 'px-10 py-5 text-lg',
}

type MagneticButtonProps = {
  as?: React.ElementType
  href?: string
  size?: keyof typeof sizes
  arrow?: boolean
  strength?: number
  contentStrength?: number
  fillClassName?: string
  className?: string
  children: string
} & Omit<React.HTMLAttributes<HTMLElement>, 'children'>

export function MagneticButton({
  as,
  href,
  size = 'md',
  arrow = false,
  strength = 0.3,
  contentStrength = 0.2,
  fillClassName = 'bg-muted-foreground',
  className,
  children,
  ...props
}: MagneticButtonProps) {
  const Tag = as ?? (href ? 'a' : 'button')
  const label = arrow ? `${children} ↗` : children

  return (
    <Magnetic strength={strength} contentStrength={contentStrength}>
      <Tag
        href={href}
        type={Tag === 'button' ? 'button' : undefined}
        className={cn(
          'group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary leading-none font-medium text-primary-foreground uppercase',
          sizes[size],
          className,
        )}
        {...props}
      >
        <span className="absolute inset-0 overflow-hidden">
          <span
            className={cn(
              'block size-full translate-y-full rounded-t-[50%] transition-[translate,border-radius] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:rounded-none',
              fillClassName,
            )}
          />
        </span>
        <span className="relative block [translate:var(--magnetic-x,0px)_var(--magnetic-y,0px)] overflow-hidden">
          <span
            data-label={label}
            className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full after:absolute after:top-full after:left-0 after:content-[attr(data-label)]"
          >
            {label}
          </span>
        </span>
      </Tag>
    </Magnetic>
  )
}
