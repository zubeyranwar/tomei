import { cn } from '@/lib/utils'

type InfoSectionProps = {
  title?: React.ReactNode
  action?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export function InfoSection({ title, action, className, children }: InfoSectionProps) {
  return (
    <section
      className={cn('flex flex-col gap-3 border-b py-5 first:pt-0 last:border-0', className)}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-2">
          {title && <h2 className="text-sm text-muted-foreground">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function InfoRow({
  icon,
  className,
  children,
}: {
  icon?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <p
      className={cn(
        'flex min-w-0 items-center gap-2.5 text-sm [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
    >
      {icon && <span className="flex text-muted-foreground">{icon}</span>}
      <span className="min-w-0 truncate">{children}</span>
    </p>
  )
}
