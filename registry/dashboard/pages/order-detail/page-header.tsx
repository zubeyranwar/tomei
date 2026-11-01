import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: React.ReactNode
  badges?: React.ReactNode
  subtitle?: React.ReactNode
  backHref?: string
  breadcrumb?: React.ReactNode
  tools?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  badges,
  subtitle,
  backHref,
  breadcrumb,
  tools,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-6', className)}>
      {(backHref || breadcrumb || tools) && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {backHref && (
              <a
                href={backHref}
                aria-label="Back"
                className="flex size-8 items-center justify-center rounded-full bg-card text-foreground shadow-(--shadow-button) hover:bg-muted"
              >
                <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-4">
                  <path
                    d="M10 3 5 8l5 5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            )}
            {breadcrumb}
          </div>
          {tools && <div className="flex items-center gap-1.5">{tools}</div>}
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {badges}
          </div>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
