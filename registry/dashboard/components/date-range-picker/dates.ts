export type DateRange = { start: Date; end: Date }
export type DatePreset = { label: string; range: (today: Date) => DateRange }

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
export const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export const startOfMonth = (d: Date, offset = 0) =>
  new Date(d.getFullYear(), d.getMonth() + offset, 1)
export const sameDay = (a?: Date | null, b?: Date | null) =>
  !!a && !!b && a.getTime() === b.getTime()
export const sameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
export const sameRange = (a: DateRange, b: DateRange) =>
  sameDay(a.start, b.start) && sameDay(a.end, b.end)

const pad = (n: number) => String(n).padStart(2, '0')

export const toInputValue = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function fromInputValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return null
  const [y, m, d] = match.slice(1).map(Number)
  const date = new Date(y, m - 1, d)
  return date.getMonth() === m - 1 ? date : null
}

const dayFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const fullFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function formatRange({ start, end }: DateRange) {
  if (sameDay(start, end)) return fullFormat.format(start)
  if (sameMonth(start, end))
    return `${dayFormat.format(start)}–${fullFormat.format(end).replace(/^\w+ /, '')}`
  return start.getFullYear() === end.getFullYear()
    ? `${dayFormat.format(start)}–${fullFormat.format(end)}`
    : `${fullFormat.format(start)}–${fullFormat.format(end)}`
}

export const defaultPresets: DatePreset[] = [
  { label: 'Today', range: (t) => ({ start: t, end: t }) },
  { label: 'Yesterday', range: (t) => ({ start: addDays(t, -1), end: addDays(t, -1) }) },
  { label: 'Last 7 days', range: (t) => ({ start: addDays(t, -6), end: t }) },
  { label: 'Last 30 days', range: (t) => ({ start: addDays(t, -29), end: t }) },
  { label: 'Last 90 days', range: (t) => ({ start: addDays(t, -89), end: t }) },
  { label: 'Last 365 days', range: (t) => ({ start: addDays(t, -364), end: t }) },
  {
    label: 'Last month',
    range: (t) => ({ start: startOfMonth(t, -1), end: addDays(startOfMonth(t), -1) }),
  },
  {
    label: 'Last 12 months',
    range: (t) => ({ start: startOfMonth(t, -12), end: addDays(startOfMonth(t), -1) }),
  },
  {
    label: 'Last year',
    range: (t) => ({
      start: new Date(t.getFullYear() - 1, 0, 1),
      end: new Date(t.getFullYear() - 1, 11, 31),
    }),
  },
  { label: 'Week to date', range: (t) => ({ start: addDays(t, -t.getDay()), end: t }) },
  { label: 'Month to date', range: (t) => ({ start: startOfMonth(t), end: t }) },
  {
    label: 'Quarter to date',
    range: (t) => ({
      start: new Date(t.getFullYear(), t.getMonth() - (t.getMonth() % 3), 1),
      end: t,
    }),
  },
  { label: 'Year to date', range: (t) => ({ start: new Date(t.getFullYear(), 0, 1), end: t }) },
]
