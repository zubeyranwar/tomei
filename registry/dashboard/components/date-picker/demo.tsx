'use client'

import { useState } from 'react'

import { Field } from '@/registry/dashboard/components/input/input'

import { DatePicker } from './date-picker'
import { MonthPicker } from './month-picker'
import { TimePicker } from './time-picker'

export default function Demo() {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:30')
  const [month, setMonth] = useState('')

  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
      <Field label="Delivery date" htmlFor="date" hint="From today onwards">
        <DatePicker id="date" value={date} onChange={setDate} min={today()} />
      </Field>
      <Field label="Arrival time" htmlFor="time" hint="Between 7 AM and 6 PM">
        <TimePicker id="time" value={time} onChange={setTime} step={30} min="07:00" max="18:00" />
      </Field>
      <Field label="Billing month" htmlFor="month">
        <MonthPicker id="month" value={month} onChange={setMonth} />
      </Field>
    </div>
  )
}

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
