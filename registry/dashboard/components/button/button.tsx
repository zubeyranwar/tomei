import { cn } from '@/lib/utils'

const variants = {
  primary:
    'bg-primary text-primary-foreground shadow-(--shadow-button-primary) hover:bg-primary/90',
  secondary: 'bg-card text-foreground shadow-(--shadow-button) hover:bg-muted',
  ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
  danger: 'bg-card text-destructive shadow-(--shadow-button) hover:bg-destructive/10',
}

const sizes = {
  sm: 'h-7 px-2.5 text-xs',
  md: 'h-8 px-3 text-sm',
  lg: 'h-10 px-4 text-sm',
  icon: 'size-8',
  'icon-sm': 'size-7',
}

export type ButtonProps = {
  as?: React.ElementType
  href?: string
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  as,
  href,
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const Tag = as ?? (href ? 'a' : 'button')

  return (
    <Tag
      href={href}
      type={Tag === 'button' ? (props.type ?? 'button') : undefined}
      disabled={Tag === 'button' ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg leading-none font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="animate-spin">
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="3"
          />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      {children}
    </Tag>
  )
}
