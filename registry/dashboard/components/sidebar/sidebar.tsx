import { cn } from '@/lib/utils'

export function Sidebar({ className, ...props }: React.ComponentProps<'aside'>) {
  return (
    <aside
      className={cn(
        'flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function SidebarHeader({
  logo,
  title,
  subtitle,
  href,
  className,
}: {
  logo?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  href?: string
  className?: string
}) {
  const Tag = href ? 'a' : 'div'
  return (
    <Tag
      href={href}
      className={cn(
        'flex shrink-0 items-center gap-2 border-b border-sidebar-border bg-sidebar-accent p-3',
        className,
      )}
    >
      {logo && <span className="flex size-8 shrink-0 items-center justify-center">{logo}</span>}
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-sm leading-none font-medium text-sidebar-accent-foreground">
          {title}
        </span>
        {subtitle && <span className="truncate text-xs leading-none">{subtitle}</span>}
      </span>
    </Tag>
  )
}

export function SidebarContent({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      className={cn(
        'min-h-0 flex-1 overflow-y-auto [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-sidebar-border',
        className,
      )}
      {...props}
    />
  )
}

export function SidebarGroup({
  title,
  action,
  className,
  children,
}: {
  title?: React.ReactNode
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-1 p-3', className)}>
      {title && (
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs leading-none font-semibold tracking-wide text-sidebar-foreground uppercase">
            {title}
          </span>
          {action}
        </div>
      )}
      <ul className="flex flex-col gap-px">{children}</ul>
    </div>
  )
}

export function SidebarItem({
  as,
  href,
  icon,
  count,
  active = false,
  external = false,
  submenu,
  className,
  children,
  ...props
}: {
  as?: React.ElementType
  href?: string
  icon?: React.ReactNode
  count?: number
  active?: boolean
  external?: boolean
  submenu?: React.ReactNode
} & React.HTMLAttributes<HTMLElement>) {
  const Tag = as ?? (href ? 'a' : 'button')

  return (
    <li>
      <Tag
        href={href}
        type={Tag === 'button' ? 'button' : undefined}
        data-active={active}
        aria-current={active ? 'page' : undefined}
        {...(external && { target: '_blank', rel: 'noreferrer' })}
        className={cn(
          'group flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-sm transition-colors duration-150 outline-none hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-(--shadow-button) [&_svg]:size-4 [&_svg]:shrink-0',
          className,
        )}
        {...props}
      >
        {icon && (
          <span className="flex opacity-80 group-hover:text-sidebar-accent-foreground group-data-[active=true]:text-sidebar-primary-foreground">
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate">{children}</span>
        {count !== undefined && (
          <span className="inline-flex h-4 min-w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-accent px-1 text-[11px] tabular-nums">
            {count}
          </span>
        )}
        {external && (
          <span aria-hidden className="opacity-60">
            ↗
          </span>
        )}
      </Tag>
      {submenu && <ul className="mt-px flex flex-col gap-px pl-6">{submenu}</ul>}
    </li>
  )
}

export function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex shrink-0 flex-col gap-px border-t border-sidebar-border p-3', className)}
      {...props}
    />
  )
}
