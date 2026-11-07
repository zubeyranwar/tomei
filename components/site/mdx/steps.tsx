export function Steps({ children }: { children: React.ReactNode }) {
  return (
    <ol className="flex list-none flex-col gap-6 border-l pl-6 [counter-reset:step]">{children}</ol>
  )
}

export function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="relative flex flex-col gap-3 [counter-increment:step] before:absolute before:top-0 before:-left-[2.3rem] before:flex before:size-7 before:items-center before:justify-center before:rounded-full before:bg-secondary before:font-mono before:text-xs before:content-[counter(step)]">
      <p className="font-medium">{title}</p>
      {children}
    </li>
  )
}
