import { cn } from '@/lib/utils'

const tones = {
  yellow: 'bg-yellow-200/80 dark:bg-yellow-400/25',
  blue: 'bg-sky-200/80 dark:bg-sky-400/25',
  pink: 'bg-pink-200/80 dark:bg-pink-400/25',
}

type NoteProps = {
  label?: React.ReactNode
  tone?: keyof typeof tones
  className?: string
  children: React.ReactNode
}

export function Note({ label, tone = 'yellow', className, children }: NoteProps) {
  return (
    <figure className={cn('flex flex-col gap-1.5 border-l pl-3', className)}>
      {label && <figcaption className="text-xs text-muted-foreground">{label}</figcaption>}
      <blockquote className="text-sm leading-7">
        <span className={cn('box-decoration-clone px-1.5 py-1', tones[tone])}>{children}</span>
      </blockquote>
    </figure>
  )
}
