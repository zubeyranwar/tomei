import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Record Form',
  description:
    'A schema-driven CRM form with batteries: describe sections and fields as data and get accordion, tab, card or step-by-step layouts, an edit mode and a click-to-edit view mode, 17 field types including people pickers, files, time, month, lists and editable tables with totals, calculated fields, show/hide and required-when conditions, validation rules, a useRecordForm state hook, a Standard Schema adapter for Zod, Valibot or ArkType, a react-hook-form adapter, uploads with progress and retry (native or react-dropzone), role permissions, drafts, autosave, a leave warning, translations and dayjs-powered locale dates.',
  categories: ['forms', 'crm'],
  dependencies: ['dayjs'],
  registryDependencies: ['input', 'date-picker', 'toast', 'popover', 'dialog'],
  docs: [
    'Batteries: const form = useRecordForm({ sections, initialValues }) then <RecordForm {...form.formProps} />.',
    'Zod, Valibot or ArkType: pass resolver: standardSchema(schema) to useRecordForm.',
    'react-hook-form: run npx shadcn add record-form-rhf, then import { recordFormResolver, useRecordFormBinding },',
    'use useForm({ resolver: recordFormResolver({ sections, schema }) }) and <RecordForm sections={sections} {...useRecordFormBinding(form)} />.',
    'Uploads: pass upload={xhrUploader({ url: "/api/upload" })} or your own (file, { onProgress, signal }) => Promise<{ url }>; for react-dropzone run npx shadcn add record-form-dropzone and pass dropzone={useReactDropzone}.',
    'Roles: permissions: { view, edit } on fields and sections, then roles={user.roles}.',
    'Translations: messages={{ required: "{label} est obligatoire" }} or translate={(key, vars) => i18n.t(`form.${key}`, vars)}; import a dayjs locale and pass locale="fr".',
    'Drafts and autosave: useRecordForm({ draftKey: "order-1078", autosave: { save } }).',
  ].join('\n'),
  cssVars: {
    light: {
      'shadow-button':
        '0 1px 2px rgb(0 0 0 / 0.05), 0 0 0 1px rgb(0 0 0 / 0.1), inset 0 1px 0 rgb(255 255 255 / 0.8)',
      'shadow-card': '0 1px 2px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(0 0 0 / 0.07)',
      'shadow-overlay': '0 16px 40px rgb(0 0 0 / 0.12), 0 0 0 1px rgb(0 0 0 / 0.08)',
    },
    dark: {
      'shadow-button':
        '0 0 0 1px rgb(0 0 0 / 0.4), inset 0 1px 0 rgb(255 255 255 / 0.1), inset 0 0 0 1px rgb(255 255 255 / 0.06)',
      'shadow-card':
        '0 4px 4px rgb(42 42 42 / 0.32), 0 0 0 1px #0e0e0e, inset 0 1px 0 rgb(255 255 255 / 0.08), inset 0 0 0 1px rgb(255 255 255 / 0.08)',
      'shadow-overlay': '0 16px 40px rgb(0 0 0 / 0.5), 0 0 0 1px #0e0e0e',
    },
  },
  date: '2026-10-29',
})
