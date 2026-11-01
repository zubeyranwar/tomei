import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Record Form RHF',
  description:
    'react-hook-form adapter for Record Form: one resolver for schema rules plus any Standard Schema, and a binding hook for values, errors, blur and wizard steps.',
  categories: ['forms', 'adapters'],
  dependencies: ['react-hook-form'],
  registryDependencies: ['record-form'],
  docs: 'useForm({ resolver: recordFormResolver({ sections, schema }) }) then <RecordForm sections={sections} {...useRecordFormBinding(form)} />.',
  hidden: true,
  date: '2026-11-01',
})
