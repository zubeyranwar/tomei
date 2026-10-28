'use client'

import { useState } from 'react'

import { Badge } from '@/registry/dashboard/components/badge/badge'

import { DataTable, type Column, type Filter, type View } from './data-table'

type Order = {
  id: string
  placed: number
  date: string
  customer: string
  total: number
  payment: 'Paid' | 'Payment pending' | 'Refunded'
  fulfillment: 'Unfulfilled' | 'Fulfilled' | 'On hold'
  items: number
}

const names = ['Ava Brooks', 'Leo Turner', 'Mia Patel', 'Noah Kim', 'Zoe Carter', 'Eli Morgan']
const payments: Order['payment'][] = ['Paid', 'Paid', 'Payment pending', 'Paid', 'Refunded']
const fulfillments: Order['fulfillment'][] = ['Unfulfilled', 'Fulfilled', 'On hold', 'Unfulfilled']

const orders: Order[] = Array.from({ length: 12 }, (_, i) => ({
  id: `#${2050 - i}`,
  placed: 12 - i,
  date:
    i < 4
      ? `Today at ${9 - i * 2}:${String(55 - i * 7).padStart(2, '0')} a.m.`
      : `${i - 3} days ago`,
  customer: names[i % names.length],
  total: [98.99, 396.84, 54.2, 1210.5][i % 4],
  payment: payments[i % payments.length],
  fulfillment: fulfillments[i % fulfillments.length],
  items: (i % 3) + 1,
}))

const paymentTone = {
  Paid: 'neutral',
  'Payment pending': 'attention',
  Refunded: 'critical',
} as const
const fulfillmentTone = {
  Unfulfilled: 'warning',
  Fulfilled: 'success',
  'On hold': 'warning',
} as const

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const columns: Column<Order>[] = [
  {
    key: 'order',
    header: 'Order',
    sortValue: (o) => o.placed,
    cell: (o) => <span className="font-semibold">{o.id}</span>,
  },
  { key: 'date', header: 'Date', sortValue: (o) => o.placed, cell: (o) => o.date },
  { key: 'customer', header: 'Customer', sortValue: (o) => o.customer, cell: (o) => o.customer },
  {
    key: 'total',
    header: 'Total',
    align: 'right',
    sortValue: (o) => o.total,
    cell: (o) => currency.format(o.total),
  },
  {
    key: 'payment',
    header: 'Payment status',
    cell: (o) => (
      <Badge tone={paymentTone[o.payment]} indicator={o.payment === 'Paid' ? 'dot' : 'ring'}>
        {o.payment}
      </Badge>
    ),
  },
  {
    key: 'fulfillment',
    header: 'Fulfillment status',
    cell: (o) => (
      <Badge
        tone={fulfillmentTone[o.fulfillment]}
        indicator={o.fulfillment === 'Fulfilled' ? 'dot' : 'ring'}
      >
        {o.fulfillment}
      </Badge>
    ),
  },
  {
    key: 'items',
    header: 'Items',
    sortValue: (o) => o.items,
    cell: (o) => `${o.items} ${o.items === 1 ? 'item' : 'items'}`,
  },
]

const views: View<Order>[] = [
  { label: 'Unfulfilled', filter: (o) => o.fulfillment === 'Unfulfilled' },
  { label: 'Unpaid', filter: (o) => o.payment === 'Payment pending' },
  { label: 'On hold', filter: (o) => o.fulfillment === 'On hold' },
]

const filters: Filter<Order>[] = [
  {
    key: 'payment',
    label: 'Payment status',
    options: ['Paid', 'Payment pending', 'Refunded'],
    value: (o) => o.payment,
  },
  {
    key: 'fulfillment',
    label: 'Fulfillment status',
    options: ['Unfulfilled', 'Fulfilled', 'On hold'],
    value: (o) => o.fulfillment,
  },
]

export default function Demo() {
  const [loading, setLoading] = useState(false)

  const refresh = () =>
    new Promise<void>((resolve) => {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        resolve()
      }, 900)
    })

  return (
    <div className="w-full max-w-5xl">
      <DataTable
        rows={orders}
        columns={columns}
        getRowId={(o) => o.id}
        views={views}
        filters={filters}
        searchText={(o) => `${o.id} ${o.customer}`}
        searchPlaceholder="Search orders or customers"
        selectable
        pageSize={6}
        onRefresh={refresh}
        loading={loading}
        bulkActions={() => (
          <>
            <button type="button" className="text-foreground hover:underline">
              Mark as fulfilled
            </button>
            <button type="button" className="text-foreground hover:underline">
              Print labels
            </button>
          </>
        )}
      />
    </div>
  )
}
