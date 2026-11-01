import { cn } from '@/lib/utils'

const tones = {
  neutral: 'bg-foreground/8 text-muted-foreground',
  success: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-400/15 dark:text-yellow-200',
  attention: 'bg-orange-200 text-orange-900 dark:bg-orange-400/15 dark:text-orange-200',
  critical: 'bg-red-100 text-red-900 dark:bg-red-500/15 dark:text-red-300',
  info: 'bg-sky-100 text-sky-900 dark:bg-sky-500/15 dark:text-sky-300',
}

type BadgeProps = React.ComponentProps<'span'> & {
  tone?: keyof typeof tones
  indicator?: 'dot' | 'ring' | 'none'
}

export function Badge({
  tone = 'neutral',
  indicator = 'none',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-lg px-2 text-[13px] leading-none font-medium whitespace-nowrap',
        tones[tone],
        className,
      )}
      {...props}
    >
      {indicator !== 'none' && (
        <span
          aria-hidden
          className={cn(
            'size-2 shrink-0 rounded-full',
            indicator === 'dot' ? 'bg-current opacity-60' : 'border-[1.5px] border-current',
          )}
        />
      )}
      {children}
    </span>
  )
}
