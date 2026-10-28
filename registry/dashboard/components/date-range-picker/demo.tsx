'use client'

import { useState } from 'react'

import { DateRangePicker, type DateRange } from './date-range-picker'

const format = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

export default function Demo() {
  const [range, setRange] = useState<{ value: DateRange; preset?: string } | null>(null)

  return (
    <div className="flex min-h-[34rem] w-full max-w-3xl flex-col items-start gap-4">
      <DateRangePicker disableFuture onChange={(value, preset) => setRange({ value, preset })} />
      <p className="text-sm text-muted-foreground">
        {range
          ? `${range.preset ?? 'Custom'}: ${format.format(range.value.start)} → ${format.format(range.value.end)}`
          : 'Pick a range and hit Apply.'}
      </p>
    </div>
  )
}
