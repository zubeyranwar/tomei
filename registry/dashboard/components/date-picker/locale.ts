import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(customParseFormat)
dayjs.extend(localizedFormat)

export { dayjs }

export const pickerLabels = {
  today: 'Today',
  now: 'Now',
  thisMonth: 'This month',
  clear: 'Clear',
  apply: 'Apply',
  time: 'Time',
  start: 'Start',
  end: 'End',
  startDate: 'Start date',
  endDate: 'End date',
  typeDate: 'Type a date, e.g. {example}',
  typeTime: 'Type a time, e.g. {example}',
  pickDate: 'Pick a date',
  pickTime: 'Pick a time',
  pickMonth: 'Pick a month',
  pickDates: 'Pick dates',
  pickDateTime: 'Pick a date and time',
  pickStart: 'Pick the start date',
  pickEnd: 'Now pick the end date',
  pickDayTime: 'Pick a day and a time',
  pickTimeNext: 'Now pick a time',
  pickDayNext: 'Now pick a day',
  use: 'Use {time}',
  noTimes: 'No matching times',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  chooseDate: 'Choose a date',
  chooseTime: 'Choose a time',
  chooseMonth: 'Choose a month',
  chooseRange: 'Choose a date range',
  chooseDateTime: 'Choose a date and time',
  clearValue: 'Clear',
}

export type PickerLabels = typeof pickerLabels

export const label = (
  labels: Partial<PickerLabels> | undefined,
  key: keyof PickerLabels,
  vars: Record<string, string> = {},
) => (labels?.[key] ?? pickerLabels[key]).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '')

const DATE_INPUTS = [
  'YYYY-MM-DD',
  'D/M/YYYY',
  'DD/MM/YYYY',
  'M/D/YYYY',
  'MM/DD/YYYY',
  'D.M.YYYY',
  'D MMM YYYY',
  'D MMMM YYYY',
  'MMM D YYYY',
  'MMM D, YYYY',
  'MMMM D YYYY',
  'MMMM D, YYYY',
]

const TIME_INPUTS = [
  'H:mm',
  'HH:mm',
  'h:mm a',
  'h:mma',
  'h a',
  'ha',
  'hmm a',
  'hmma',
  'HHmm',
  'Hmm',
  'H',
]

export function parseDay(text: string, locale?: string): Date | null {
  const t = text.trim()
  if (!t) return null
  for (const format of DATE_INPUTS) {
    const d = locale ? dayjs(t, format, locale, true) : dayjs(t, format, true)
    if (d.isValid()) return d.startOf('day').toDate()
  }
  return null
}

export function parseClock(text: string, locale?: string): string | null {
  const t = text
    .trim()
    .toLowerCase()
    .replace(/\.(?=m)/g, '')
    .replace(/([ap])$/, '$1m')
  if (!t) return null
  for (const format of TIME_INPUTS) {
    const d = locale ? dayjs(t, format, locale, true) : dayjs(t, format, true)
    if (d.isValid()) return d.format('HH:mm')
  }
  return null
}

export const formatDay = (date: Date, locale?: string) =>
  (locale ? dayjs(date).locale(locale) : dayjs(date)).format('ll')

export const formatClock = (hhmm: string, locale?: string) => {
  const d = dayjs(hhmm, 'HH:mm', true)
  return d.isValid() ? (locale ? d.locale(locale) : d).format('LT') : hhmm
}

export const formatMonthYear = (date: Date, locale?: string) =>
  (locale ? dayjs(date).locale(locale) : dayjs(date)).format('MMM YYYY')

export const monthName = (date: Date, locale?: string) =>
  (locale ? dayjs(date).locale(locale) : dayjs(date)).format('MMMM YYYY')

export const shortMonths = (locale?: string) =>
  Array.from({ length: 12 }, (_, i) =>
    (locale ? dayjs().locale(locale) : dayjs()).month(i).format('MMM'),
  )

export const fullMonth = (year: number, month: number, locale?: string) =>
  (locale ? dayjs().locale(locale) : dayjs()).year(year).month(month).format('MMMM YYYY')
