export function Callout({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2 rounded-xl bg-secondary/60 px-6 py-5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="text-signal">→</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
