'use client'

import { useState } from 'react'
import { Minus, Plus, Search, Trash2, Undo2 } from 'lucide-react'

import { Badge } from '@/registry/dashboard/components/badge/badge'
import { Button } from '@/registry/dashboard/components/button/button'
import { Input } from '@/registry/dashboard/components/input/input'
import { Popover } from '@/registry/dashboard/components/record-form/popover'

export type EditItem = {
  id: string
  name: string
  variant?: string
  color?: string
  price: number
  quantity: number
}

export type Product = Omit<EditItem, 'quantity'>

type LineItemEditorProps = {
  items: EditItem[]
  original: EditItem[]
  catalog: Product[]
  money: Intl.NumberFormat
  onChange: (items: EditItem[], merge?: string) => void
}

function Swatch({ color }: { color?: string }) {
  return (
    <span
      className="block size-11 shrink-0 rounded-lg bg-muted"
      style={color ? { background: color } : undefined}
    />
  )
}

function PriceInput({
  value,
  label,
  onCommit,
}: {
  value: number
  label: string
  onCommit: (value: number) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const commit = () => {
    if (draft === null) return
    const next = Number(draft)
    if (!Number.isNaN(next) && next >= 0) onCommit(Math.round(next * 100) / 100)
    setDraft(null)
  }

  return (
    <Input
      aria-label={label}
      inputMode="decimal"
      leading="$"
      value={draft ?? value.toFixed(2)}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && commit()}
      className="w-24"
    />
  )
}

function Stepper({
  value,
  label,
  onChange,
}: {
  value: number
  label: string
  onChange: (value: number) => void
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex h-8 items-center rounded-lg border border-input bg-card"
    >
      <button
        type="button"
        aria-label="Decrease"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className="flex h-full w-7 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
      >
        <Minus className="size-3" />
      </button>
      <span className="w-6 text-center text-sm tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(value + 1)}
        className="flex h-full w-7 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        <Plus className="size-3" />
      </button>
    </div>
  )
}

export function LineItemEditor({ items, original, catalog, money, onChange }: LineItemEditorProps) {
  const [query, setQuery] = useState('')
  const removed = original.filter((o) => !items.some((i) => i.id === o.id))
  const shown = catalog.filter((p) =>
    `${p.name} ${p.variant ?? ''}`.toLowerCase().includes(query.toLowerCase()),
  )

  const patch = (id: string, change: Partial<EditItem>, merge?: string) =>
    onChange(
      items.map((i) => (i.id === id ? { ...i, ...change } : i)),
      merge,
    )

  const add = (product: Product) => {
    const existing = items.find((i) => i.id === product.id)
    if (existing) return patch(product.id, { quantity: existing.quantity + 1 })
    const before = original.find((o) => o.id === product.id)
    onChange([...items, before ?? { ...product, quantity: 1 }])
  }

  const addCustom = () =>
    onChange([
      ...items,
      { id: `custom-${Date.now().toString(36)}`, name: '', price: 0, quantity: 1 },
    ])

  const status = (item: EditItem) => {
    const before = original.find((o) => o.id === item.id)
    if (!before) return <Badge tone="success">New</Badge>
    if (before.quantity !== item.quantity || before.price !== item.price)
      return <Badge tone="attention">Edited</Badge>
    return null
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Line items</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={addCustom}>
            Custom item
          </Button>
          <div>
            <Popover
              align="end"
              className="w-72"
              trigger={({ open, toggle }) => (
                <Button aria-expanded={open} onClick={toggle}>
                  <Plus /> Add product
                </Button>
              )}
            >
              {(close) => (
                <>
                  <Input
                    autoFocus
                    leading={<Search />}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products"
                    aria-label="Search products"
                    className="mb-1"
                  />
                  <ul className="max-h-64 overflow-y-auto">
                    {shown.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => {
                            add(p)
                            setQuery('')
                            close()
                          }}
                          className="flex w-full items-center gap-3 rounded-lg p-1.5 text-left hover:bg-muted"
                        >
                          <span
                            className="size-8 shrink-0 rounded-md bg-muted"
                            style={p.color ? { background: p.color } : undefined}
                          />
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm">{p.name}</span>
                            {p.variant && (
                              <span className="text-xs text-muted-foreground">{p.variant}</span>
                            )}
                          </span>
                          <span className="text-sm text-muted-foreground tabular-nums">
                            {money.format(p.price)}
                          </span>
                        </button>
                      </li>
                    ))}
                    {!shown.length && (
                      <li className="px-2 py-4 text-center text-sm text-muted-foreground">
                        No products match
                      </li>
                    )}
                  </ul>
                </>
              )}
            </Popover>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card shadow-(--shadow-card)">
        <ul className="divide-y px-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[auto_1fr_auto_auto_5.5rem_auto]"
            >
              <Swatch color={item.color} />
              <span className="flex min-w-0 flex-col items-start gap-1.5">
                {item.id.startsWith('custom-') ? (
                  <Input
                    aria-label="Item name"
                    autoFocus={!item.name}
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => patch(item.id, { name: e.target.value }, `name-${item.id}`)}
                  />
                ) : (
                  <span className="truncate text-sm font-medium">{item.name}</span>
                )}
                <span className="flex items-center gap-1.5">
                  {item.variant && (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs">
                      {item.variant}
                    </span>
                  )}
                  {status(item)}
                </span>
              </span>
              <div className="col-span-2 col-start-2 flex items-center gap-3 max-sm:order-last sm:contents">
                <PriceInput
                  label={`Price of ${item.name || 'item'}`}
                  value={item.price}
                  onCommit={(price) => patch(item.id, { price })}
                />
                <Stepper
                  label={`Quantity of ${item.name || 'item'}`}
                  value={item.quantity}
                  onChange={(quantity) => patch(item.id, { quantity })}
                />
                <span className="ml-auto text-right text-sm tabular-nums sm:ml-0">
                  {money.format(item.price * item.quantity)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${item.name || 'item'}`}
                onClick={() => onChange(items.filter((i) => i.id !== item.id))}
              >
                <Trash2 />
              </Button>
            </li>
          ))}

          {removed.map((item) => (
            <li
              key={item.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3 text-muted-foreground"
            >
              <span className="opacity-40">
                <Swatch color={item.color} />
              </span>
              <span className="flex min-w-0 flex-col items-start gap-1.5">
                <span className="truncate text-sm line-through">{item.name}</span>
                <Badge tone="critical">Removed</Badge>
              </span>
              <Button size="sm" onClick={() => onChange([...items, item])}>
                <Undo2 /> Restore
              </Button>
            </li>
          ))}

          {!items.length && !removed.length && (
            <li className="py-8 text-center text-sm text-muted-foreground">
              No items yet. Add a product to get started.
            </li>
          )}
        </ul>
      </div>
    </section>
  )
}
