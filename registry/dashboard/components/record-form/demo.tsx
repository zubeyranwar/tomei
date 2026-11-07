'use client'

import 'dayjs/locale/fr'

import { useMemo, useState } from 'react'
import { Building2, ClipboardList, Layers, Package, Paperclip, Wallet } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { cn } from '@/lib/utils'
import { toast, Toaster } from '@/registry/dashboard/components/toast/toast'
import { Button } from '@/registry/dashboard/components/button/button'

import {
  applyComputed,
  ChangeList,
  RecordForm,
  recordFormResolver,
  useFormChanges,
  type FormLayout,
  type FormSection,
  type FormValues,
  type Messages,
  type OptionObject,
  type Row,
  type Uploader,
} from './record-form'

const money = (n: number) => Math.round(n * 100) / 100
const lineTotal = (rows: unknown) =>
  (Array.isArray(rows) ? (rows as Row[]) : []).reduce(
    (s, r) => s + (Number(r.qty) || 0) * (Number(r.cost) || 0),
    0,
  )

const COMPANIES = [
  'Abay',
  'Bole',
  'Entoto',
  'Gihon',
  'Harar',
  'Lalibela',
  'Rift',
  'Sheba',
  'Tana',
  'Zeway',
]
const KINDS = ['Construction', 'Trading', 'Real Estate', 'Engineering', 'Holdings', 'Logistics']
const CITIES = ['Addis Ababa', 'Adama', 'Bahir Dar', 'Hawassa', 'Mekelle', 'Dire Dawa']
const customers: OptionObject[] = Array.from({ length: 10000 }, (_, i) => ({
  value: `cus-${i + 1}`,
  label: `${COMPANIES[i % 10]} ${KINDS[Math.floor(i / 10) % 6]} ${Math.floor(i / 60) + 1}`,
  description: `${CITIES[i % 6]} · C-${String(i + 1).padStart(5, '0')}`,
  avatar: COMPANIES[i % 10][0] + KINDS[Math.floor(i / 10) % 6][0],
}))
const people: OptionObject[] = [
  ['Hana Solomon', 'Finance officer'],
  ['Dawit Mekonnen', 'Site supervisor'],
  ['Selam Girma', 'Architect'],
  ['Amanuel Girma', 'Site supervisor'],
  ['Naol Tesfaye', 'Commercial'],
  ['Yodit Alemayehu', 'Project coordinator'],
].map(([label, description], i) => ({
  value: `emp-${i + 1}`,
  label,
  description,
  avatar: label
    .split(' ')
    .map((w) => w[0])
    .join(''),
}))
const addresses = [
  'Bole Road, Addis Ababa',
  'Bole Medhanialem, Addis Ababa',
  'Kazanchis, Addis Ababa',
  'Piassa, Addis Ababa',
  'CMC Road, Addis Ababa',
  'Adama Industrial Park, Adama',
  'Kebele 14, Bahir Dar',
  'Piazza, Hawassa',
]

const fakeServer = <T,>(result: () => T, ms = 350) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(result()), ms))

const searchCustomers = (q: string) =>
  fakeServer(() => {
    const t = q.trim().toLowerCase()
    return customers
      .filter(
        (c) => !t || c.label.toLowerCase().includes(t) || c.description!.toLowerCase().includes(t),
      )
      .slice(0, 20)
  })
const searchPeople = (q: string) =>
  fakeServer(
    () => people.filter((p) => p.label.toLowerCase().includes(q.trim().toLowerCase())),
    150,
  )
const searchAddresses = (q: string) =>
  fakeServer(() =>
    addresses
      .filter((a) => a.toLowerCase().includes(q.trim().toLowerCase()))
      .map((a) => ({ value: a, label: a })),
  )

const sections: FormSection[] = [
  {
    id: 'client',
    title: 'Client & contract',
    icon: <Building2 />,
    columns: 3,
    span: 'full',
    fields: [
      {
        name: 'customer',
        label: 'Customer',
        type: 'lookup',
        required: true,
        search: searchCustomers,
        options: [customers[41]],
        hint: '10,000 customers, searched on the server',
      },
      {
        name: 'team',
        label: 'Project team',
        type: 'lookup',
        multiple: true,
        search: searchPeople,
        options: people,
      },
      { name: 'phone', label: 'Site phone', type: 'phone', defaultCountry: 'ET' },
      { name: 'site', label: 'Site address', type: 'address', search: searchAddresses, span: 2 },
      { name: 'period', label: 'Contract period', type: 'daterange', required: true },
      { name: 'inspection', label: 'First inspection', type: 'datetime', step: 30 },
      {
        name: 'value',
        label: 'Contract value',
        type: 'currency',
        decimals: 2,
        min: 0,
        permissions: { edit: ['finance', 'admin'] },
        hint: 'Only Finance and Admin can change this',
      },
      { name: 'retention', label: 'Retention', type: 'percent', min: 0, max: 20, decimals: 1 },
      {
        name: 'effort',
        label: 'Estimated effort',
        type: 'duration',
        max: 60 * 24 * 30,
        hint: 'Try “2d 4h”, “90m” or “1:30”',
      },
      { name: 'scope', label: 'Scope of work', type: 'richtext', maxLength: 2000 },
      {
        name: 'signedBy',
        label: 'Client signature',
        type: 'signature',
        permissions: { view: ['finance', 'admin'] },
      },
    ],
  },
  {
    id: 'request',
    title: 'Request',
    icon: <ClipboardList />,
    columns: 3,
    span: 'full',
    defaultOpen: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, span: 2, maxLength: 80 },
      {
        name: 'requester',
        label: 'Requested by',
        type: 'select',
        required: true,
        options: [
          {
            value: 'emp-1',
            label: 'Hana Solomon',
            description: 'Finance',
            avatar: 'HS',
            color: '#7c3aed',
          },
          {
            value: 'emp-2',
            label: 'Dawit Mekonnen',
            description: 'Site supervisor',
            avatar: 'DM',
            color: '#0891b2',
          },
          {
            value: 'emp-3',
            label: 'Selam Girma',
            description: 'Architect',
            avatar: 'SG',
            color: '#ea580c',
          },
        ],
      },
      { name: 'neededBy', label: 'Needed by', type: 'date', required: true, min: 'today' },
      {
        name: 'window',
        label: 'Delivery from',
        type: 'time',
        step: 30,
        min: '07:00',
        max: '17:00',
      },
      { name: 'budgetMonth', label: 'Budget month', type: 'month' },
    ],
  },
  {
    id: 'items',
    title: 'Items',
    icon: <Package />,
    columns: 3,
    span: 'full',
    fields: [
      {
        name: 'lines',
        label: 'Line items',
        type: 'rows',
        required: true,
        minLength: 1,
        addLabel: 'Add item',
        totals: ['qty', 'total'],
        columns: [
          { name: 'item', label: 'Item', type: 'text', required: true },
          { name: 'qty', label: 'Qty', type: 'number', required: true, min: 1 },
          { name: 'unit', label: 'Unit', type: 'select', options: ['pcs', 'm', 'm²', 'kg', 'bag'] },
          {
            name: 'cost',
            label: 'Unit cost',
            type: 'currency',
            required: true,
            min: 0,
            decimals: 2,
          },
          {
            name: 'status',
            label: 'Stock',
            type: 'select',
            options: ['In stock', 'Backorder'],
          },
          {
            name: 'eta',
            label: 'Expected',
            type: 'date',
            min: 'today',
            visibleWhen: { field: 'status', is: 'Backorder' },
            required: true,
          },
          {
            name: 'total',
            label: 'Line total',
            type: 'currency',
            decimals: 2,
            compute: (row) => money((Number(row.qty) || 0) * (Number(row.cost) || 0)).toFixed(2),
          },
        ],
        details: [
          {
            name: 'supplier',
            label: 'Supplier',
            type: 'lookup',
            search: searchCustomers,
            options: [customers[41]],
          },
          { name: 'notes', label: 'Notes', type: 'textarea' },
          {
            name: 'deliveries',
            label: 'Deliveries',
            type: 'rows',
            addLabel: 'Add delivery',
            totals: ['qty'],
            columns: [
              { name: 'date', label: 'Date', type: 'date', required: true },
              { name: 'qty', label: 'Qty', type: 'number', required: true, min: 1 },
              { name: 'received', label: 'Received', type: 'toggle' },
            ],
          },
        ],
      },
      {
        name: 'subtotal',
        label: 'Subtotal',
        type: 'currency',
        compute: (v) => money(lineTotal(v.lines)).toFixed(2),
      },
      {
        name: 'vat',
        label: 'VAT (15%)',
        type: 'currency',
        compute: (v) => money(lineTotal(v.lines) * 0.15).toFixed(2),
      },
      {
        name: 'total',
        label: 'Total',
        type: 'currency',
        compute: (v) => money(lineTotal(v.lines) * 1.15).toFixed(2),
      },
    ],
  },
  {
    id: 'phases',
    title: 'Phases',
    description:
      'Break the work into phases. Each phase has its own owner, budget and deliverables.',
    icon: <Layers />,
    span: 'full',
    fields: [
      {
        name: 'phases',
        label: 'Phases',
        type: 'group',
        itemLabel: 'Phase',
        titleField: 'name',
        minLength: 1,
        fields: [
          { name: 'name', label: 'Phase name', type: 'text', required: true },
          { name: 'owner', label: 'Owner', type: 'lookup', search: searchPeople, options: people },
          { name: 'period', label: 'Dates', type: 'daterange' },
          { name: 'budget', label: 'Budget', type: 'currency', decimals: 2 },
          {
            name: 'deliverables',
            label: 'Deliverables',
            type: 'rows',
            addLabel: 'Add deliverable',
            columns: [
              { name: 'title', label: 'Deliverable', type: 'text', required: true },
              { name: 'due', label: 'Due', type: 'date' },
              { name: 'done', label: 'Done', type: 'toggle' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'payment',
    title: 'Payment schedule',
    description: 'Split the payment into milestones. The shares must add up to 100%.',
    icon: <Wallet />,
    fields: [
      {
        name: 'schedule',
        label: 'Milestones',
        type: 'rows',
        addLabel: 'Add milestone',
        totals: ['pct'],
        sum: { column: 'pct', equals: 100 },
        columns: [
          { name: 'name', label: 'Milestone', type: 'text', required: true },
          { name: 'pct', label: 'Share (%)', type: 'number', required: true, min: 1, max: 100 },
          { name: 'due', label: 'Due', type: 'date' },
        ],
      },
    ],
  },
  {
    id: 'approval',
    permissions: { edit: ['admin'] },
    title: 'Approval & files',
    icon: <Paperclip />,
    columns: 2,
    fields: [
      {
        name: 'approval',
        label: 'Decision',
        type: 'radio',
        span: 'full',
        options: [
          { value: 'approved', label: 'Approved', description: 'Purchasing can order everything.' },
          {
            value: 'partial',
            label: 'Partially approved',
            description: 'Only part is approved. Say which part below.',
          },
          { value: 'rejected', label: 'Not approved', description: 'Nothing is ordered.' },
        ],
      },
      {
        name: 'approvalNote',
        label: 'What is approved',
        type: 'textarea',
        span: 'full',
        visibleWhen: { field: 'approval', is: 'partial' },
        required: true,
      },
      {
        name: 'checks',
        label: 'Checks done',
        type: 'multiselect',
        display: 'checkboxes',
        options: [
          'Three quotes compared',
          'Within budget',
          'Supplier licence valid',
          'Specs signed off',
        ],
      },
      { name: 'specs', label: 'Specification notes', type: 'list', maxLength: 6 },
      {
        name: 'quotes',
        label: 'Quotes',
        type: 'file',
        accept: '.pdf,image/*',
        maxSize: 8 * 1024 * 1024,
        maxLength: 3,
      },
    ],
  },
]

const fakeUpload: Uploader = (file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    let progress = 0
    const timer = setInterval(() => {
      progress += 8 + Math.random() * 14
      onProgress(Math.min(progress, 100))
      if (progress < 100) return
      clearInterval(timer)
      if (/fail/i.test(file.name)) reject(new Error('Server rejected the file'))
      else resolve({ url: URL.createObjectURL(file) })
    }, 180)
    signal.addEventListener('abort', () => {
      clearInterval(timer)
      reject(new DOMException('Upload cancelled', 'AbortError'))
    })
  })

const fr: Messages = {
  required: '{label} est obligatoire',
  email: 'Saisissez une adresse e-mail valide',
  minNumber: 'Doit être au moins {min}',
  maxNumber: 'Doit être au plus {max}',
  minDate: 'Doit être le {min} ou après',
  minCount: 'Ajoutez au moins {count} {noun}',
  sumEquals: '{label} doit totaliser {equals} (actuellement {total})',
  'noun.row_one': 'ligne',
  'noun.row_other': 'lignes',
  yes: 'Oui',
  no: 'Non',
  searchFields: 'Rechercher des champs',
  needsAttention: 'À vérifier',
  calculated: 'Calculé automatiquement',
  next: 'Suivant',
  back: 'Retour',
  review: 'Vérifier',
  submit: 'Envoyer',
  addRow: 'Ajouter une ligne',
  pasteTip: 'Astuce : collez depuis Excel ou Sheets · Entrée sur la dernière ligne en ajoute une',
  chooseFiles: 'Choisir des fichiers',
  orDropMany: 'ou déposez-les ici',
  uploadingPercent: 'Envoi… {progress} %',
  uploadError: 'Échec de l’envoi',
  retry: 'Réessayer',
  today: 'Aujourd’hui',
  now: 'Maintenant',
  clear: 'Effacer',
  pickDate: 'Choisir une date',
  pickDates: 'Choisir des dates',
  draftFound: 'Vous avez un brouillon non enregistré de {time}.',
  restore: 'Restaurer',
  discard: 'Ignorer',
  autosaving: 'Enregistrement…',
  autosavedAt: 'Enregistré à {time}',
  undo: 'Annuler',
  rowDeleted: 'Ligne {n} supprimée',
}

const schema = z.object({
  title: z.string().refine((t) => !/^untitled/i.test(t), 'Give the request a real title'),
})

const layouts: FormLayout[] = ['accordion', 'tabs', 'cards', 'steps']

function Pills<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly T[]
  onChange: (value: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-lg bg-muted p-0.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={cn(
            'h-7 rounded-md px-3 text-sm capitalize transition-colors',
            value === o
              ? 'bg-card font-medium text-foreground shadow-(--shadow-button)'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

const defaultValues = applyComputed(sections, {
  customer: 'cus-42',
  team: ['emp-3'],
  phone: '+251 911 234 567',
  site: '',
  period: '',
  inspection: '',
  value: '1500000',
  retention: '5',
  effort: '2160',
  scope: '<p>Supply and fix <b>rebar</b> for the ground slab.</p>',
  signedBy: '',
  title: 'Untitled request',
  requester: 'emp-2',
  neededBy: '',
  window: '08:00',
  budgetMonth: '2026-11',
  lines: [
    {
      id: 'a',
      item: 'Rebar 12 mm',
      qty: '40',
      unit: 'pcs',
      cost: '620.00',
      status: 'In stock',
      eta: '',
      supplier: 'cus-42',
      notes: '',
      deliveries: [{ id: 'd1', date: '2026-11-20', qty: '20', received: false }],
    },
    {
      id: 'b',
      item: 'Cement',
      qty: '25',
      unit: 'bag',
      cost: '',
      status: 'Backorder',
      eta: '',
      supplier: '',
      notes: '',
      deliveries: [],
    },
  ],
  phases: [
    {
      id: 'ph1',
      name: 'Foundations',
      owner: 'emp-2',
      period: '',
      budget: '450000.00',
      deliverables: [{ id: 'dl1', title: 'Excavation sign-off', due: '', done: false }],
    },
  ],
  schedule: [
    { id: 'p1', name: 'Advance', pct: '30', due: '' },
    { id: 'p2', name: 'On delivery', pct: '60', due: '' },
  ],
  approval: 'approved',
  approvalNote: '',
  checks: ['Within budget'],
  specs: ['Grade 60 steel'],
  quotes: [],
})

export default function Demo() {
  const [layout, setLayout] = useState<FormLayout>('accordion')
  const [mode, setMode] = useState<'edit' | 'view'>('edit')
  const [saved, setSaved] = useState(false)
  const [role, setRole] = useState<'viewer' | 'finance' | 'admin'>('admin')
  const [lang, setLang] = useState<'en' | 'fr'>('en')
  const [autosaveOn, setAutosaveOn] = useState<'off' | 'on'>('off')
  const roles = useMemo(() => [role], [role])
  const autosave = useMemo(
    () =>
      autosaveOn === 'on'
        ? { save: () => new Promise<void>((r) => setTimeout(r, 700)), delay: 1200 }
        : undefined,
    [autosaveOn],
  )
  const form = useForm<FormValues>({
    defaultValues,
    mode: 'onBlur',
    resolver: recordFormResolver({
      sections,
      schema,
      roles,
      locale: lang,
      messages: lang === 'fr' ? fr : undefined,
    }),
  })
  const changes = useFormChanges(form, sections, { roles, locale: lang })

  const save = async (values: FormValues) => {
    await toast.promise(new Promise((r) => setTimeout(r, 800)), {
      loading: 'Saving request…',
      success: 'Request saved',
      error: 'Couldn’t save the request',
    })
    form.reset(values)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Pills label="Layout" value={layout} options={layouts} onChange={setLayout} />
        <Pills label="Mode" value={mode} options={['edit', 'view'] as const} onChange={setMode} />
        <Pills
          label="Role"
          value={role}
          options={['viewer', 'finance', 'admin'] as const}
          onChange={setRole}
        />
        <Pills label="Language" value={lang} options={['en', 'fr'] as const} onChange={setLang} />
        <Pills
          label="Autosave"
          value={autosaveOn}
          options={['off', 'on'] as const}
          onChange={setAutosaveOn}
        />
      </div>
      <RecordForm
        key={layout + mode}
        form={form}
        sections={sections}
        onSubmit={save}
        layout={layout}
        mode={mode}
        sectionColumns={layout === 'cards' ? 2 : 1}
        currency="ETB "
        submitLabel="Send for approval"
        roles={roles}
        locale={lang}
        messages={lang === 'fr' ? fr : undefined}
        upload={fakeUpload}
        draftKey="demo-purchase-request"
        autosave={autosave}
      />
      <ChangeList changes={changes} />
      <Toaster />
      {layout !== 'steps' && (
        <div className="flex justify-end gap-2">
          <Button disabled={!form.formState.isDirty} onClick={() => form.reset()}>
            Discard
          </Button>
          <Button
            variant="primary"
            loading={form.formState.isSubmitting}
            onClick={form.handleSubmit(save)}
          >
            {saved ? 'Saved ✓' : 'Save request'}
          </Button>
        </div>
      )}
    </div>
  )
}
