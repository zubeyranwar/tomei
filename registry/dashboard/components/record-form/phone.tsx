'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

import { useFormConfig } from './context'
import { optionRow } from './controls'
import { Popover } from '@/registry/dashboard/components/popover/popover'

export type Country = { code: string; name: string; dial: string }

export const countries: Country[] = [
  { code: 'ET', name: 'Ethiopia', dial: '251' },
  { code: 'US', name: 'United States', dial: '1' },
  { code: 'CA', name: 'Canada', dial: '1' },
  { code: 'GB', name: 'United Kingdom', dial: '44' },
  { code: 'DE', name: 'Germany', dial: '49' },
  { code: 'FR', name: 'France', dial: '33' },
  { code: 'IT', name: 'Italy', dial: '39' },
  { code: 'ES', name: 'Spain', dial: '34' },
  { code: 'NL', name: 'Netherlands', dial: '31' },
  { code: 'SE', name: 'Sweden', dial: '46' },
  { code: 'CH', name: 'Switzerland', dial: '41' },
  { code: 'TR', name: 'Turkey', dial: '90' },
  { code: 'AE', name: 'United Arab Emirates', dial: '971' },
  { code: 'SA', name: 'Saudi Arabia', dial: '966' },
  { code: 'EG', name: 'Egypt', dial: '20' },
  { code: 'KE', name: 'Kenya', dial: '254' },
  { code: 'UG', name: 'Uganda', dial: '256' },
  { code: 'TZ', name: 'Tanzania', dial: '255' },
  { code: 'RW', name: 'Rwanda', dial: '250' },
  { code: 'DJ', name: 'Djibouti', dial: '253' },
  { code: 'SO', name: 'Somalia', dial: '252' },
  { code: 'SD', name: 'Sudan', dial: '249' },
  { code: 'NG', name: 'Nigeria', dial: '234' },
  { code: 'GH', name: 'Ghana', dial: '233' },
  { code: 'ZA', name: 'South Africa', dial: '27' },
  { code: 'IN', name: 'India', dial: '91' },
  { code: 'CN', name: 'China', dial: '86' },
  { code: 'JP', name: 'Japan', dial: '81' },
  { code: 'KR', name: 'South Korea', dial: '82' },
  { code: 'SG', name: 'Singapore', dial: '65' },
  { code: 'AU', name: 'Australia', dial: '61' },
  { code: 'BR', name: 'Brazil', dial: '55' },
  { code: 'MX', name: 'Mexico', dial: '52' },
]

const flag = (code: string) =>
  String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))

const group = (digits: string) => digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim()

export function splitPhone(value: string, fallback: string) {
  const match = /^\+(\d+)\s*(.*)$/.exec(value.trim())
  if (!match)
    return {
      country: countries.find((c) => c.code === fallback) ?? countries[0],
      national: value.replace(/\D/g, ''),
    }
  const digits = match[1] + match[2].replace(/\D/g, '')
  const preferred = countries.find((c) => c.code === fallback)
  const country =
    (preferred && digits.startsWith(preferred.dial) ? preferred : undefined) ??
    [...countries]
      .sort((a, b) => b.dial.length - a.dial.length)
      .find((c) => digits.startsWith(c.dial)) ??
    countries[0]
  return { country, national: digits.slice(country.dial.length) }
}

export function PhoneField({
  id,
  value,
  defaultCountry = 'US',
  placeholder,
  disabled,
  invalid,
  describedBy,
  onChange,
}: {
  id: string
  value: string
  defaultCountry?: string
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  onChange: (value: string) => void
}) {
  const { t } = useFormConfig()
  const parsed = splitPhone(value, defaultCountry)
  const [chosen, setChosen] = useState<Country | null>(null)
  const country = chosen ?? parsed.country
  const [query, setQuery] = useState('')
  const shown = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.dial.startsWith(query.replace(/\D/g, '') || '§'),
  )
  const emit = (c: Country, national: string) =>
    onChange(national ? `+${c.dial} ${group(national)}` : '')

  return (
    <div
      className={cn(
        'flex h-8 w-full min-w-0 items-center rounded-lg border border-input bg-card text-sm focus-within:border-ring',
        invalid && 'border-destructive',
        disabled && 'bg-muted/40',
      )}
    >
      <div className="shrink-0">
        <Popover
          className="w-64"
          trigger={({ open, toggle }) => (
            <button
              type="button"
              aria-label={t('countryCode', { name: country.name, dial: country.dial })}
              aria-haspopup="listbox"
              aria-expanded={open}
              disabled={disabled}
              onClick={toggle}
              className="flex h-[30px] items-center gap-1.5 rounded-l-lg border-r border-input px-2 tabular-nums hover:bg-muted disabled:hover:bg-transparent"
            >
              <span aria-hidden>{flag(country.code)}</span>
              <span className="text-muted-foreground">+{country.dial}</span>
            </button>
          )}
        >
          {(close) => (
            <>
              <input
                autoFocus
                value={query}
                placeholder={t('searchCountry')}
                aria-label={t('searchCountries')}
                onChange={(e) => setQuery(e.target.value)}
                className="mb-1 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus:border-ring"
              />
              <ul role="listbox" className="max-h-64 overflow-y-auto">
                {shown.map((c) => (
                  <li key={c.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={c.code === country.code}
                      onClick={() => {
                        setChosen(c)
                        emit(c, parsed.national)
                        setQuery('')
                        close()
                      }}
                      className={optionRow}
                    >
                      <span aria-hidden>{flag(c.code)}</span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="text-muted-foreground tabular-nums">+{c.dial}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Popover>
      </div>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        readOnly={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        value={group(parsed.national)}
        placeholder={placeholder ?? t('phoneNumber')}
        onChange={(e) => {
          const raw = e.target.value.trim()
          if (raw.startsWith('+')) {
            const next = splitPhone(raw, country.code)
            setChosen(next.country)
            return emit(next.country, next.national)
          }
          emit(country, raw.replace(/\D/g, '').slice(0, 15))
        }}
        className="h-full min-w-0 flex-1 bg-transparent px-2.5 tabular-nums outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}
