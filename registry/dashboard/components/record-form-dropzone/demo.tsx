'use client'

import {
  RecordForm,
  useRecordForm,
  type FormSection,
} from '@/registry/dashboard/components/record-form/record-form'

import { useReactDropzone } from './record-form-dropzone'

const sections: FormSection[] = [
  {
    id: 'files',
    title: 'Documents',
    fields: [
      {
        name: 'files',
        label: 'Files',
        type: 'file',
        accept: '.pdf,image/*',
        maxSize: 8 * 1024 * 1024,
      },
    ],
  },
]

export default function Demo() {
  const form = useRecordForm({ sections, initialValues: { files: [] }, dropzone: useReactDropzone })
  return (
    <div className="w-full max-w-lg">
      <RecordForm layout="cards" searchable={false} {...form.formProps} />
    </div>
  )
}
