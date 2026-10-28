import { cn } from '@/lib/utils'

type InputProps = React.ComponentProps<'input'> & {
  leading?: React.ReactNode
  trailing?: React.ReactNode
}

export function Input({ leading, trailing, className, ...props }: InputProps) {
  return (
    <div
      className={cn(
        'flex h-8 w-full min-w-0 items-center gap-2 rounded-lg border border-input bg-card px-2.5 text-sm text-foreground transition-[border-color] duration-150 focus-within:border-ring has-disabled:opacity-50 has-aria-invalid:border-destructive [&_svg]:size-3.5 [&_svg]:shrink-0',
        className,
      )}
    >
      {leading && <span className="flex text-muted-foreground">{leading}</span>}
      <input
        className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        {...props}
      />
      {trailing && <span className="flex text-muted-foreground">{trailing}</span>}
    </div>
  )
}

type FieldProps = {
  label: React.ReactNode
  htmlFor: string
  hint?: React.ReactNode
  error?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

export function Field({ label, htmlFor, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-muted-foreground"> *</span>}
      </label>
      {children}
      {error ? (
        <span id={`${htmlFor}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </span>
      ) : (
        hint && (
          <span id={`${htmlFor}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </span>
        )
      )}
    </div>
  )
}
