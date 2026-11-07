'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Button } from '@/registry/dashboard/components/button/button'
import {
  RecordForm,
  recordFormResolver,
  type FormSection,
  type FormValues,
} from '@/registry/dashboard/components/record-form/record-form'

import { Drawer } from './drawer'

const sections: FormSection[] = [
  {
    id: 'contact',
    title: 'Contact',
    columns: 2,
    defaultOpen: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, span: 2 },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'phone', defaultCountry: 'ET' },
      { name: 'stage', label: 'Stage', type: 'select', options: ['Lead', 'Customer', 'Partner'] },
      { name: 'since', label: 'Customer since', type: 'date', max: 'today' },
    ],
  },
]

export default function Demo() {
  const [open, setOpen] = useState(false)
  const form = useForm<FormValues>({
    defaultValues: {
      name: 'Selam Girma',
      email: 'selam@example.com',
      phone: '',
      stage: 'Customer',
      since: '',
    },
    resolver: recordFormResolver({ sections }),
  })
  const save = form.handleSubmit((values) => {
    form.reset(values)
    setOpen(false)
  })
  const name = useWatch({ control: form.control, name: 'name' })

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open contact</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title={String(name || 'Contact')}
        description="Customer · Addis Ababa"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button variant="primary" disabled={!form.formState.isDirty} onClick={save}>
              Save changes
            </Button>
          </>
        }
      >
        <RecordForm form={form} sections={sections} layout="cards" searchable={false} />
      </Drawer>
    </>
  )
}
