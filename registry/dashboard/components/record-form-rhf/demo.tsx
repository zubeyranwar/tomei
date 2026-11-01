'use client'

import { useForm } from 'react-hook-form'

import { Button } from '@/registry/dashboard/components/button/button'
import {
  RecordForm,
  type FormSection,
  type FormValues,
} from '@/registry/dashboard/components/record-form/record-form'

import { recordFormResolver, useRecordFormBinding } from './record-form-rhf'

const sections: FormSection[] = [
  {
    id: 'supplier',
    title: 'Supplier',
    columns: 2,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email' },
    ],
  },
]

export default function Demo() {
  const form = useForm<FormValues>({
    defaultValues: { name: '', email: '' },
    resolver: recordFormResolver({ sections }),
  })
  return (
    <form onSubmit={form.handleSubmit(() => {})} className="flex w-full max-w-lg flex-col gap-3">
      <RecordForm
        layout="cards"
        searchable={false}
        sections={sections}
        {...useRecordFormBinding(form)}
      />
      <Button type="submit" variant="primary" className="self-end">
        Save
      </Button>
    </form>
  )
}
