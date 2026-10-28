import { cn } from '@/lib/utils'

export function Badge({
  tone = 'muted',
  className,
  ...props
}: React.ComponentProps<'span'> & { tone?: 'muted' | 'signal' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[0.2rem] px-1.5 py-0.5 eyebrow',
        tone === 'signal' ? 'bg-signal text-sand-200' : 'bg-secondary text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}
