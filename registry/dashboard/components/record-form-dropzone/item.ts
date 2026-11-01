import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Record Form Dropzone',
  description:
    'react-dropzone adapter for Record Form file fields: accept, size and count rules, drag state and rejections handled by react-dropzone.',
  categories: ['forms', 'adapters'],
  dependencies: ['react-dropzone'],
  registryDependencies: ['record-form'],
  docs: 'Pass dropzone={useReactDropzone} to RecordForm, useRecordForm or RecordFormProvider.',
  hidden: true,
  date: '2026-11-01',
})
