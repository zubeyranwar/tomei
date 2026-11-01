'use client'

import { useMemo, useState } from 'react'
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Globe,
  Home,
  Package,
  Redo2,
  ShoppingBag,
  Undo2,
  Users,
  X,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/registry/dashboard/components/badge/badge'
import { Button } from '@/registry/dashboard/components/button/button'
import { ToggleField } from '@/registry/dashboard/components/record-form/controls'
import {
  RecordForm,
  validateRecord,
  visibleFields,
  type FormLayout,
  type FormSection,
  type FormValues,
} from '@/registry/dashboard/components/record-form/record-form'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
} from '@/registry/dashboard/components/sidebar/sidebar'
import { useHistory } from '@/registry/dashboard/components/use-history/use-history'

import { ChangeList, diffRecord } from './changes'
import * as demo from './data'
import { LineItemEditor, type EditItem, type Product } from './line-item-editor'
import { StagePath } from './stage-path'
import { computeTotals, TotalsCard } from './totals'

type Snapshot = { values: FormValues; items: EditItem[] }

export type OrderEditProps = {
  title?: string
  subtitle?: string
  sections?: FormSection[]
  values?: FormValues
  items?: EditItem[]
  catalog?: Product[]
  stageField?: string
  fields?: { discount?: string; shipping?: string; code?: string }
  badges?: { label: string; tone?: React.ComponentProps<typeof Badge>['tone'] }[]
  formLayout?: FormLayout
  paid?: number
  taxRate?: number
  formatOptions?: Intl.NumberFormatOptions
}

const num = (value: unknown) =>
  typeof value === 'number' ? value : typeof value === 'string' ? Number(value) || 0 : 0

export function OrderEdit({
  title = 'Order #1078',
  subtitle = 'Placed Oct 29, 2026 via Online Store',
  sections = demo.sections,
  values: initialValues = demo.values,
  items: initialItems = demo.items,
  catalog = demo.catalog,
  stageField = 'stage',
  fields = demo.totalFields,
  badges = demo.badges,
  formLayout = 'accordion',
  paid = 394.49,
  taxRate = 0.08875,
  formatOptions = { style: 'currency', currency: 'USD' },
}: OrderEditProps) {
  const initial = useMemo(
    () => ({ values: initialValues, items: initialItems }),
    [initialValues, initialItems],
  )
  const history = useHistory<Snapshot>(initial, { hotkeys: true })
  const { values, items } = history.value
  const [saved, setSaved] = useState<Snapshot>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notify, setNotify] = useState(true)
  const [justSaved, setJustSaved] = useState(false)

  const money = useMemo(() => new Intl.NumberFormat('en-US', formatOptions), [formatOptions])
  const changes = diffRecord(sections, saved, history.value)
  const dirty = changes.length > 0

  const stageOptions = sections.flatMap((s) => s.fields).find((f) => f.name === stageField)?.options
  const totalsOf = (s: Snapshot) => {
    const shown = new Set(visibleFields(sections, s.values).map((f) => f.name))
    const read = (name?: string) => (name && shown.has(name) ? num(s.values[name]) : 0)
    return computeTotals(s.items, read(fields.discount), read(fields.shipping), taxRate)
  }
  const totals = totalsOf(history.value)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  const setValue = (name: string, value: FormValues[string]) => {
    history.set((s) => ({ ...s, values: { ...s.values, [name]: value } }), { merge: name })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const cancel = () => {
    history.reset(saved)
    setErrors({})
  }

  const save = () => {
    const found = validateRecord(sections, values)
    if (items.some((i) => !i.name.trim())) found.items = 'Every item needs a name'
    setErrors(found)
    if (Object.values(found).some(Boolean)) return
    setSaved(history.value)
    history.reset()
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1500)
  }

  return (
    <div className="flex h-svh overflow-hidden bg-sidebar text-foreground">
      <Sidebar className="border-r-0 max-lg:hidden">
        <SidebarHeader
          logo={<span className="size-8 rounded-lg bg-sidebar-primary-foreground" />}
          title="Tomei"
          subtitle="Store admin"
        />
        <SidebarContent>
          <SidebarGroup>
            <SidebarItem icon={<Home />}>Home</SidebarItem>
            <SidebarItem icon={<ShoppingBag />} count={12} active>
              Orders
            </SidebarItem>
            <SidebarItem icon={<Package />}>Products</SidebarItem>
            <SidebarItem icon={<Users />}>Customers</SidebarItem>
            <SidebarItem icon={<BarChart3 />}>Analytics</SidebarItem>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarItem icon={<Globe />}>Online store</SidebarItem>
        </SidebarFooter>
      </Sidebar>

      <main className="min-w-0 flex-1 overflow-y-auto bg-card lg:my-2 lg:mr-2 lg:rounded-2xl lg:border">
        <header className="sticky top-0 z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-card/90 px-4 py-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <ShoppingBag className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium">Edit {title.toLowerCase()}</span>
            {dirty && (
              <span className="text-amber-600 max-md:hidden dark:text-amber-400">
                · {changes.length} unsaved
              </span>
            )}
          </div>

          <div
            role="toolbar"
            aria-label="Edit actions"
            className="flex items-center gap-1 rounded-xl bg-primary p-1 text-primary-foreground shadow-lg"
          >
            <button
              type="button"
              disabled={!dirty}
              onClick={cancel}
              className="h-7 rounded-lg px-3 text-sm font-medium hover:bg-primary-foreground/10 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!dirty}
              onClick={save}
              className={cn(
                'h-7 rounded-lg bg-primary-foreground px-3 text-sm font-medium text-primary disabled:opacity-50',
                justSaved && 'disabled:opacity-100',
              )}
            >
              {justSaved ? 'Saved ✓' : 'Save'}
            </button>
          </div>

          <div className="flex justify-end gap-1.5">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
              disabled={!history.canUndo}
              onClick={history.undo}
            >
              <Undo2 />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Redo"
              title="Redo (Ctrl+Shift+Z)"
              disabled={!history.canRedo}
              onClick={history.redo}
            >
              <Redo2 />
            </Button>
            <Button size="icon" aria-label="Previous record" className="max-sm:hidden">
              <ChevronUp />
            </Button>
            <Button size="icon" aria-label="Next record" className="max-sm:hidden">
              <ChevronDown />
            </Button>
            <Button size="icon" variant="ghost" aria-label="Close">
              <X />
            </Button>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 pt-4 pb-16">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {badges.map((b) => (
                  <Badge
                    key={b.label}
                    tone={b.tone}
                    indicator={!b.tone || b.tone === 'neutral' ? 'dot' : 'ring'}
                  >
                    {b.label}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {stageOptions && (
              <StagePath
                stages={stageOptions}
                value={String(values[stageField] ?? '')}
                onChange={(stage) => setValue(stageField, stage)}
              />
            )}
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem]">
            <div className="flex min-w-0 flex-col gap-8">
              <div className="flex flex-col gap-2">
                <LineItemEditor
                  items={items}
                  original={saved.items}
                  catalog={catalog}
                  money={money}
                  onChange={(next, merge) =>
                    history.set((s) => ({ ...s, items: next }), merge ? { merge } : undefined)
                  }
                />
                {errors.items && <p className="text-sm text-destructive">{errors.items}</p>}
              </div>

              <TotalsCard
                totals={totals}
                before={totalsOf(saved)}
                count={count}
                paid={paid}
                taxRate={taxRate}
                discountLabel={fields.code ? String(values[fields.code] ?? '') : undefined}
                money={money}
              >
                <ToggleField
                  id="notify"
                  value={notify}
                  label="Email the customer an updated invoice on save"
                  onChange={setNotify}
                />
              </TotalsCard>

              {dirty && <ChangeList changes={changes} />}
            </div>

            <RecordForm
              layout={formLayout}
              sections={sections}
              values={values}
              errors={errors}
              onChange={setValue}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
