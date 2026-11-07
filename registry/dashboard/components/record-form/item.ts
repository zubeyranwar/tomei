import { defineItem } from '@/registry/define'

export default defineItem({
  title: 'Record Form',
  description:
    'A schema-driven CRM form built on react-hook-form: describe sections and fields as data and get accordion, tab, card or step-by-step layouts, an edit mode and a click-to-edit view mode, 17 field types including people pickers, files, time, month, lists and editable tables with totals, calculated fields, show/hide and required-when conditions, validation rules through one resolver that also takes Zod, Valibot or ArkType, uploads with progress and retry, role permissions, drafts, autosave, a leave warning, translations and dayjs-powered locale dates.',
  categories: ['forms', 'crm'],
  dependencies: ['dayjs', 'react-hook-form', 'react-dropzone'],
  registryDependencies: ['input', 'date-picker', 'toast', 'popover', 'dialog'],
  docs: [
    'const form = useForm<FormValues>({ defaultValues, resolver: recordFormResolver({ sections }) }) then <RecordForm form={form} sections={sections} />.',
    'Zod, Valibot or ArkType: recordFormResolver({ sections, schema }). Validation timing is plain react-hook-form: useForm({ mode: "onBlur" }).',
    'Saving: <RecordForm onSubmit={save} /> for the steps layout, or form.handleSubmit(save) on your own button; call form.reset(values) after a save.',
    'Changes: const changes = useFormChanges(form, sections) then <ChangeList changes={changes} />.',
    'Uploads: pass upload={xhrUploader({ url: "/api/upload" })} or your own (file, { onProgress, signal }) => Promise<{ url }>.',
    'Roles: permissions: { view, edit } on fields and sections, then roles={user.roles} on RecordForm and recordFormResolver.',
    'Translations: messages={{ required: "{label} est obligatoire" }} or translate={(key, vars) => i18n.t(`form.${key}`, vars)}; import a dayjs locale and pass locale="fr". Pass the same to recordFormResolver for error messages.',
    'Drafts and autosave: <RecordForm draftKey="order-1078" autosave={{ save }} />.',
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
