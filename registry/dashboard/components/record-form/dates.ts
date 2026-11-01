import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(customParseFormat)
dayjs.extend(localizedFormat)

export { dayjs }

const ISO_DATE = 'YYYY-MM-DD'
const ISO_MONTH = 'YYYY-MM'
const ISO_TIME = 'HH:mm'
const ISO_DATETIME = 'YYYY-MM-DDTHH:mm'

const DATE_INPUTS = [
  ISO_DATE,
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

const local = (value: dayjs.ConfigType, format?: string, locale?: string) => {
  const d = format ? dayjs(value, format, true) : dayjs(value)
  return locale ? d.locale(locale) : d
}

export const todayIso = () => dayjs().format(ISO_DATE)
export const thisMonthIso = () => dayjs().format(ISO_MONTH)

export function formatDate(iso: string, locale?: string) {
  const d = local(iso, ISO_DATE, locale)
  return d.isValid() ? d.format('ll') : iso
}

export function formatMonth(iso: string, locale?: string) {
  const d = local(iso, ISO_MONTH, locale)
  return d.isValid() ? d.format('MMM YYYY') : iso
}

export function formatTime(hhmm: string, locale?: string) {
  const d = local(hhmm, ISO_TIME, locale)
  return d.isValid() ? d.format('LT') : hhmm
}

export function formatDateTime(value: string, locale?: string) {
  const d = local(value, ISO_DATETIME, locale)
  if (d.isValid()) return d.format('lll')
  return formatDate(value.slice(0, 10), locale)
}

export function formatDateRange(value: string, locale?: string) {
  const [a, b] = value.split('/')
  if (!a) return ''
  return b ? `${formatDate(a, locale)} – ${formatDate(b, locale)}` : formatDate(a, locale)
}

export function formatRelative(date: Date, locale?: string) {
  const d = local(date, undefined, locale)
  const minutes = dayjs().diff(d, 'minute')
  if (minutes < 1) return d.format('LT')
  if (dayjs().isSame(d, 'day')) return d.format('LT')
  return d.format('lll')
}

export function parseDateInput(text: string, locale?: string): string | null {
  const t = text.trim()
  if (!t) return null
  for (const format of DATE_INPUTS) {
    const d = locale ? dayjs(t, format, locale, true) : dayjs(t, format, true)
    if (d.isValid()) return d.format(ISO_DATE)
  }
  return null
}

export const isIsoDate = (value: string) => dayjs(value, ISO_DATE, true).isValid()
export const isIsoDateTime = (value: string) => dayjs(value, ISO_DATETIME, true).isValid()
