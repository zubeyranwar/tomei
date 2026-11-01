'use client'

import { useState } from 'react'
import { Briefcase, Building2, Settings2, Star, UserRound } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/registry/dashboard/components/button/button'

import {
  RecordForm,
  validateRecord,
  type FieldTypeRenderer,
  type FormLayout,
  type FormSection,
  type FormValues,
} from './record-form'

const sections: FormSection[] = [
  {
    id: 'contact',
    title: 'Contact',
    icon: <UserRound />,
    columns: 3,
    defaultOpen: true,
    span: 'full',
    fields: [
      { name: 'firstName', label: 'First name', type: 'text', required: true },
      { name: 'lastName', label: 'Last name', type: 'text', required: true },
      { name: 'jobTitle', label: 'Job title', type: 'text' },
      { name: 'email', label: 'Email', type: 'email', required: true, span: 2 },
      {
        name: 'phone',
        label: 'Phone',
        type: 'phone',
        pattern: '^\\+?[0-9 ()-]{7,}$',
        messages: { pattern: 'Use digits, spaces and an optional +' },
      },
      {
        name: 'lifecycle',
        label: 'Lifecycle stage',
        type: 'select',
        options: ['Lead', 'MQL', 'SQL', 'Opportunity', 'Customer'],
      },
      {
        name: 'customerSince',
        label: 'Customer since',
        type: 'date',
        max: 'today',
        visibleWhen: { field: 'lifecycle', is: 'Customer' },
        requiredWhen: { field: 'lifecycle', is: 'Customer' },
      },
      { name: 'score', label: 'Lead score', type: 'rating', props: { max: 5 } },
    ],
  },
  {
    id: 'company',
    title: 'Company',
    description: 'Where this contact works.',
    icon: <Building2 />,
    columns: 2,
    fields: [
      { name: 'company', label: 'Company name', type: 'text' },
      { name: 'website', label: 'Website', type: 'url', placeholder: 'example.com' },
      {
        name: 'industry',
        label: 'Industry',
        type: 'select',
        options: ['Retail', 'SaaS', 'Finance', 'Healthcare', 'Education'],
      },
      {
        name: 'employees',
        label: 'Employees',
        type: 'number',
        min: 1,
        max: 1000000,
        visibleWhen: { field: 'company', filled: true },
      },
    ],
  },
  {
    id: 'deal',
    title: 'Deal',
    icon: <Briefcase />,
    columns: 2,
    visibleWhen: { field: 'lifecycle', is: ['Opportunity', 'Customer'] },
    fields: [
      {
        name: 'amount',
        label: 'Amount',
        type: 'currency',
        min: 100,
        messages: { min: 'Deals start at ${min}' },
      },
      { name: 'closeDate', label: 'Close date', type: 'date', min: 'today' },
      { name: 'stage', label: 'Stage', type: 'radio', options: ['Open', 'Won', 'Lost'], span: 2 },
      {
        name: 'lostReason',
        label: 'Lost reason',
        type: 'select',
        options: ['Price', 'Timing', 'Competitor', 'No budget'],
        span: 2,
        visibleWhen: { field: 'stage', is: 'Lost' },
        required: true,
      },
      {
        name: 'products',
        label: 'Products',
        type: 'multiselect',
        options: ['Starter', 'Pro', 'Enterprise', 'Add-ons'],
        minLength: 1,
        maxLength: 3,
        span: 2,
      },
    ],
  },
  {
    id: 'preferences',
    title: 'Preferences',
    icon: <Settings2 />,
    fields: [
      {
        name: 'tags',
        label: 'Tags',
        type: 'multiselect',
        creatable: true,
        options: ['VIP', 'Partner', 'Newsletter'],
      },
      { name: 'optIn', label: 'Marketing emails', type: 'toggle', placeholder: 'Subscribed' },
      {
        name: 'notes',
        label: 'Notes',
        type: 'textarea',
        hint: 'Visible to your team only.',
        maxLength: 280,
      },
    ],
  },
]

const fieldTypes: Record<string, FieldTypeRenderer> = {
  rating: {
    isEmpty: (value) => !value,
    format: (value) => (value ? `${value} / 5` : '—'),
    render: ({ id, field, value, onChange }) => {
      const max = Number(field.props?.max ?? 5)
      const current = Number(value ?? 0)
      return (
        <div
          id={id}
          role="radiogroup"
          aria-label={field.label}
          className="flex h-8 items-center gap-0.5"
        >
          {Array.from({ length: max }, (_, i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={current === i + 1}
              aria-label={`${i + 1} of ${max}`}
              onClick={() => onChange(current === i + 1 ? 0 : i + 1)}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <Star className={cn('size-4', i < current && 'fill-amber-400 text-amber-400')} />
            </button>
          ))}
        </div>
      )
    },
  },
}

const layouts: FormLayout[] = ['accordion', 'tabs', 'cards']

export default function Demo() {
  const [layout, setLayout] = useState<FormLayout>('accordion')
  const [values, setValues] = useState<FormValues>({
    firstName: 'Jordan',
    lastName: 'Ellis',
    email: 'jordan@example',
    lifecycle: 'Opportunity',
    stage: 'Open',
    score: 3,
    tags: ['VIP'],
    optIn: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <div
        role="radiogroup"
        aria-label="Layout"
        className="flex self-start rounded-lg bg-muted p-0.5"
      >
        {layouts.map((l) => (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={layout === l}
            onClick={() => setLayout(l)}
            className={cn(
              'h-7 rounded-md px-3 text-sm capitalize transition-colors',
              layout === l
                ? 'bg-card font-medium text-foreground shadow-(--shadow-button)'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {l}
          </button>
        ))}
      </div>
      <RecordForm
        key={layout}
        layout={layout}
        sectionColumns={layout === 'cards' ? 2 : 1}
        sections={sections}
        values={values}
        errors={errors}
        fieldTypes={fieldTypes}
        onChange={(name, value) => {
          setValues({ ...values, [name]: value })
          if (errors[name]) setErrors({ ...errors, [name]: '' })
        }}
      />
      <div className="flex justify-end gap-2">
        <Button onClick={() => setErrors({})}>Cancel</Button>
        <Button
          variant="primary"
          onClick={() => setErrors(validateRecord(sections, values, fieldTypes))}
        >
          Save contact
        </Button>
      </div>
    </div>
  )
}
